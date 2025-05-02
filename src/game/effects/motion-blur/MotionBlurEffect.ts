import * as POSTPROCESSING from 'postprocessing';
import * as THREE from 'three';
import { MOTION_BLUR_FRAGMENT_SHADER, MOTION_BLUR_VERTEX_SHADER } from "./contants";

export default class MotionBlurEffect extends POSTPROCESSING.Effect {
  private target: THREE.WebGLRenderTarget<any>;

  private previousMatrixWorldInverse = new THREE.Matrix4();

  private previousProjectionMatrix = new THREE.Matrix4();

  private previousCameraPosition = new THREE.Vector3();

  private tmpMatrix = new THREE.Matrix4();

  constructor() {
    super('MotionBlurEffect', MOTION_BLUR_FRAGMENT_SHADER, {
      uniforms: new Map([
        ['tDepth', new THREE.Uniform(null)],
        ['tColor', new THREE.Uniform(null)],
        ['velocityFactor', new THREE.Uniform(1)],
        ['delta', new THREE.Uniform(16.67)],
        ['clipToWorldMatrix', new THREE.Uniform(new THREE.Matrix4())],
        ['previousWorldToClipMatrix', new THREE.Uniform(new THREE.Matrix4())],
        ['cameraMove', new THREE.Uniform(new THREE.Vector3())],
      ]),
      vertexShader: MOTION_BLUR_VERTEX_SHADER,
    });

    this.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.target.depthBuffer = true;
    this.target.depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight);
  }

  public update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, deltaTime?: number) {
    // this.uniforms.get('tColor').value = inputBuffer.texture;
    // this.uniforms.get('tDepth').value = inputBuffer.depthTexture;

    // super.update(renderer, inputBuffer, deltaTime);

    console.log(inputBuffer);
  }
}
