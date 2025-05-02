import * as THREE from "three";
import { Pass } from "postprocessing";
import { getVisibleChildren, isChildMaterialRenderable } from "../utils/SceneUtils";
import VelocityDepthNormalMaterial from "./material/VelocityDepthNormalMaterial";
import { copyNecessaryProps, keepMaterialMapUpdated } from "../gbuffer/utils/GBufferUtils";

type CacheMaterial = [THREE.Material, VelocityDepthNormalMaterial];

const backgroundColor = new THREE.Color(0);
const zeroVec2 = new THREE.Vector2();
const tmpProjectionMatrix = new THREE.Matrix4();
const tmpProjectionMatrixInverse = new THREE.Matrix4();

const saveBoneTexture = object => {
  let boneTexture = object.material.uniforms.prevBoneTexture.value;

  if (boneTexture && boneTexture.image.width === object.skeleton.boneTexture.width) {
    boneTexture = object.material.uniforms.prevBoneTexture.value;
    boneTexture.image.data.set(object.skeleton.boneTexture.image.data);
  } else {
    boneTexture?.dispose();

    const boneMatrices = object.skeleton.boneTexture.image.data.slice();
    const size = object.skeleton.boneTexture.image.width;

    boneTexture = new THREE.DataTexture(boneMatrices, size, size, THREE.RGBAFormat, THREE.FloatType);
    object.material.uniforms.prevBoneTexture.value = boneTexture;

    boneTexture.needsUpdate = true;
  }
}

// TODO: Добавить тип для "c"
const updateVelocityDepthNormalMaterialBeforeRender = (c: any, camera: THREE.Camera) => {
  if (c.skeleton?.boneTexture) {
    c.material.uniforms.boneTexture.value = c.skeleton.boneTexture

    if (!("USE_SKINNING" in c.material.defines)) {
      c.material.defines.USE_SKINNING = ""
      c.material.defines.BONE_TEXTURE = ""

      c.material.needsUpdate = true
    }
  }

  c.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, c.matrixWorld)

  c.material.uniforms.velocityMatrix.value.multiplyMatrices(camera.projectionMatrix, c.modelViewMatrix)
}

const updateVelocityDepthNormalMaterialAfterRender = (c, camera: THREE.Camera) => {
  c.material.uniforms.prevVelocityMatrix.value.multiplyMatrices(camera.projectionMatrix, c.modelViewMatrix)

  if (c.skeleton?.boneTexture) saveBoneTexture(c)
}

export default class VelocityDepthNormalPass extends Pass {
  public cachedMaterials: WeakMap<THREE.Mesh, CacheMaterial> = new WeakMap<THREE.Mesh, CacheMaterial>();

  public visibleMeshes: THREE.Mesh[] = [];

  public needsSwap = false;

  public renderTarget: THREE.WebGLRenderTarget<any>;

  public get texture(): THREE.Texture {
    return this.renderTarget.texture;
  }

  private _scene: THREE.Scene;

  private _camera: THREE.PerspectiveCamera;

  private lastVelocityTexture?: THREE.FramebufferTexture;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    super('VelocityDepthNormalPass');

    this._scene = scene;

    this._camera = camera;

    this.renderTarget = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    });

    this.renderTarget.texture.name = 'VelocityDepthNormalPass.Texture';

    this.renderTarget.depthTexture = new THREE.DepthTexture(1, 1);
    this.renderTarget.depthTexture.type = THREE.FloatType;
  }

  public setVelocityDepthNormalMaterialInScene() {
    this.visibleMeshes = getVisibleChildren(this._scene);

    for (const c of this.visibleMeshes) {
      const originalMaterial = c.material as THREE.MeshStandardMaterial;

      let [cachedOriginalMaterial, velocityDepthNormalMaterial] = this.cachedMaterials.get(c) || [];

      if (originalMaterial !== cachedOriginalMaterial) {
        velocityDepthNormalMaterial = new VelocityDepthNormalMaterial(this._camera);

        copyNecessaryProps(originalMaterial, velocityDepthNormalMaterial);

        c.material = velocityDepthNormalMaterial;

        // TODO: Привести к типу
        if ((c as any).skeleton?.boneTexture) saveBoneTexture(c);

        this.cachedMaterials.set(c, [originalMaterial, velocityDepthNormalMaterial]);
      }

      c.material = velocityDepthNormalMaterial;

      c.visible = isChildMaterialRenderable(c, originalMaterial);

      keepMaterialMapUpdated(
          velocityDepthNormalMaterial,
          originalMaterial,
          "normalMap",
          "USE_NORMALMAP_TANGENTSPACE",
          true
      );
      velocityDepthNormalMaterial.uniforms.normalMap.value = originalMaterial.normalMap;

      const map =
          originalMaterial.map ||
          originalMaterial.normalMap ||
          originalMaterial.roughnessMap ||
          originalMaterial.metalnessMap

      if (map) velocityDepthNormalMaterial.uniforms.uvTransform.value = map.matrix

      updateVelocityDepthNormalMaterialBeforeRender(c, this._camera)
    }
  }

  public unsetVelocityDepthNormalMaterialInScene() {
    for (const c of this.visibleMeshes) {
      c.visible = true

      updateVelocityDepthNormalMaterialAfterRender(c, this._camera)

      c.material = this.cachedMaterials.get(c)[0]
    }
  }

  public setSize(width: number, height: number) {
    this.renderTarget.setSize(width, height);

    this.lastVelocityTexture?.dispose();

    this.lastVelocityTexture = new THREE.FramebufferTexture(width, height);
    this.lastVelocityTexture.type = THREE.FloatType;
    this.lastVelocityTexture.minFilter = THREE.NearestFilter;
    this.lastVelocityTexture.magFilter = THREE.NearestFilter;
  }

  public dispose(): void {
    super.dispose();

    this.renderTarget.dispose();
  }

  public render(renderer): void {
    tmpProjectionMatrix.copy(this._camera.projectionMatrix);
    tmpProjectionMatrixInverse.copy(this._camera.projectionMatrixInverse);

    if (this._camera.view) this._camera.view.enabled = false;
    this._camera.updateProjectionMatrix();

    // in case a RenderPass is not being used, so we need to update the camera's world matrix manually
    this._camera.updateMatrixWorld();

    this.setVelocityDepthNormalMaterialInScene();

    const { background } = this._scene;

    this._scene.background = backgroundColor;

    renderer.setRenderTarget(this.renderTarget);
    renderer.copyFramebufferToTexture(this.lastVelocityTexture, zeroVec2);

    renderer.render(this._scene, this._camera);

    this._scene.background = background;

    this.unsetVelocityDepthNormalMaterialInScene();

    if (this._camera.view) this._camera.view.enabled = true;
    this._camera.projectionMatrix.copy(tmpProjectionMatrix);
    this._camera.projectionMatrixInverse.copy(tmpProjectionMatrixInverse);
  }
}
