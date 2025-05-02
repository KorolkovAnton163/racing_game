import * as THREE from "three";
import {MIRROR_SHADER} from "../consts/mirror";
import {ShaderMaterialParameters} from "three/src/materials/ShaderMaterial";

export class ReflectionMaterial extends THREE.ShaderMaterial {
    private mesh: THREE.Mesh;

    private textureMatrix: THREE.Matrix4;

    private renderTarget: THREE.WebGLRenderTarget<any>;

    private mirrorCamera: THREE.PerspectiveCamera;

    public mirrorPlane = new THREE.Plane();

    public normal = new THREE.Vector3();

    public mirrorWorldPosition = new THREE.Vector3();

    public cameraWorldPosition = new THREE.Vector3();

    public rotationMatrix = new THREE.Matrix4();

    public lookAtPosition = new THREE.Vector3(0.0, 0.0, -1.0);

    public clipPlane = new THREE.Vector4();

    public view = new THREE.Vector3();

    public target = new THREE.Vector3();

    public q = new THREE.Vector4();

    private eye: THREE.Vector3;

    private clipBias: number;

    constructor(color: number) {
        super();

        this.textureMatrix = new THREE.Matrix4();

        this.renderTarget = new THREE.WebGLRenderTarget(512, 512);

        this.mirrorCamera = new THREE.PerspectiveCamera();

        this.uniforms = THREE.UniformsUtils.clone(MIRROR_SHADER.uniforms);

        this.fragmentShader = MIRROR_SHADER.fragmentShader;

        this.vertexShader = MIRROR_SHADER.vertexShader;

        this.lights = true;

        this.fog = true;

        this.clipBias = 0.0;

        this.side = THREE.FrontSide;

        this.eye = new THREE.Vector3(0.0, 0.0, 0.0);

        this.uniforms['mirrorSampler'].value = this.renderTarget.texture;
        this.uniforms['textureMatrix'].value = this.textureMatrix;
        this.uniforms['alpha'].value = 1.0;
        this.uniforms['time'].value = 0.0;
        this.uniforms['normalSampler'].value = null;
        this.uniforms['sunColor'].value = new THREE.Color(0xffffff);
        this.uniforms['color'].value = new THREE.Color(color);
        this.uniforms['sunDirection'].value = new THREE.Vector3(0.70707, 0.70707, 0.0);
        this.uniforms['distortionScale'].value = 20.0;
        this.uniforms['size'].value = 10.0;
        this.uniforms['eye'].value = this.eye;
    }

    public setMesh(mesh: THREE.Mesh): void {
        this.mesh = mesh;
    }

    public onBeforeRender(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
        this.mirrorWorldPosition.setFromMatrixPosition(this.mesh.matrixWorld);
        this.cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);

        this.rotationMatrix.extractRotation(this.mesh.matrixWorld);

        this.normal.set(0.0, 0.0, 1.0);
        this.normal.applyMatrix4(this.rotationMatrix);

        this.view.subVectors(this.mirrorWorldPosition, this.cameraWorldPosition);

        // Avoid rendering when mirror is facing away

        if (this.view.dot(this.normal) > 0) return;

        this.view.reflect(this.normal).negate();
        this.view.add(this.mirrorWorldPosition);

        this.rotationMatrix.extractRotation(camera.matrixWorld);

        this.lookAtPosition.set(0.0, 0.0, -1.0);
        this.lookAtPosition.applyMatrix4(this.rotationMatrix);
        this.lookAtPosition.add(this.cameraWorldPosition);

        this.target.subVectors(this.mirrorWorldPosition, this.lookAtPosition);
        this.target.reflect(this.normal).negate();
        this.target.add(this.mirrorWorldPosition);

        this.mirrorCamera.position.copy(this.view);
        this.mirrorCamera.up.set(0.0, 1.0, 0.0);
        this.mirrorCamera.up.applyMatrix4(this.rotationMatrix);
        this.mirrorCamera.up.reflect(this.normal);
        this.mirrorCamera.lookAt(this.target);

        this.mirrorCamera.far = camera.far; // Used in WebGLBackground

        this.mirrorCamera.updateMatrixWorld();
        this.mirrorCamera.projectionMatrix.copy(camera.projectionMatrix);

        // Update the texture matrix
        this.textureMatrix.set(
            0.5, 0.0, 0.0, 0.5,
            0.0, 0.5, 0.0, 0.5,
            0.0, 0.0, 0.5, 0.5,
            0.0, 0.0, 0.0, 1.0
        );
        this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
        this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

        // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
        // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
        this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mirrorWorldPosition);
        this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

        this.clipPlane.set(
            this.mirrorPlane.normal.x,
            this.mirrorPlane.normal.y,
            this.mirrorPlane.normal.z,
            this.mirrorPlane.constant
        );

        const projectionMatrix = this.mirrorCamera.projectionMatrix;

        this.q.x = (Math.sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
        this.q.y = (Math.sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
        this.q.z = - 1.0;
        this.q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

        // Calculate the scaled plane vector
        this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(this.q));

        // Replacing the third row of the projection matrix
        projectionMatrix.elements[2] = this.clipPlane.x;
        projectionMatrix.elements[6] = this.clipPlane.y;
        projectionMatrix.elements[10] = this.clipPlane.z + 1.0 - this.clipBias;
        projectionMatrix.elements[14] = this.clipPlane.w;

        this.eye.setFromMatrixPosition( camera.matrixWorld );

        // Render

        const currentRenderTarget = renderer.getRenderTarget();

        const currentXrEnabled = renderer.xr.enabled;
        const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

        this.mesh.visible = false;

        renderer.xr.enabled = false; // Avoid camera modification and recursion
        renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

        renderer.setRenderTarget(this.renderTarget);

        renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

        if (renderer.autoClear === false) renderer.clear();

        renderer.render(scene, this.mirrorCamera);

        this.mesh.visible = true;

        renderer.xr.enabled = currentXrEnabled;
        renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

        renderer.setRenderTarget( currentRenderTarget );

        // Restore viewport

        const viewport = (camera as any).viewport;

        if (viewport) {
            renderer.state.viewport(viewport);
        }
    }
}
