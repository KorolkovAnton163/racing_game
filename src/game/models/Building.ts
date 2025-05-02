import * as THREE from "three";
import MaterialUtils from '../utils/Materials';
import { IGameObject } from "../interfaces/IGameObject";
import { Scene } from "../Scene";
import { IModel } from "../interfaces/IModel";
import { FRAGMENT_SHADER, MATERIAL_UNIFORMS, VERTEX_SHADER } from "../consts/material";

export default class Building implements IGameObject {
  public mesh: THREE.Object3D;

  constructor(private scene: Scene, model: IModel, dimentions: any, private textures: Map<string, THREE.Texture>) {
    this.mesh = model.body.scene.clone();

    this.mesh.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.userData.texture && this.textures.has(object.userData.texture)) {
          object.material = new THREE.MeshPhysicalMaterial({
            map: this.textures.get(object.userData.texture),
          });

          // const material = new THREE.ShaderMaterial({
          //   defines: {
          //     RECEIVE_SHADOW_CLOUDS: 1,
          //     USE_RAMP: 1,
          //   },
          //   uniformsGroups: [MaterialUtils.globalUBO()],
          //   uniforms: THREE.UniformsUtils.clone(MATERIAL_UNIFORMS),
          //   vertexShader: VERTEX_SHADER,
          //   fragmentShader: FRAGMENT_SHADER,
          //   lights: true,
          // });
          //
          // material.uniforms.tCloudsTop.value = this.textures.get('clouds_top');
          // material.uniforms.map.value = this.textures.get(object.userData.texture);
          // material.shadowSide = THREE.FrontSide;
          //
          // object.material = material;
        }
      }
    });

    this.mesh.position.set(dimentions.x, dimentions.y, dimentions.z);
    this.mesh.rotation.set(dimentions.rx, dimentions.ry, dimentions.rz);

    this.scene.addObject(this.mesh);
  }

  update(updates: Float32Array<ArrayBufferLike>): void {
    //
  }

  uuid(): string {
    return this.mesh.uuid;
  }

}
