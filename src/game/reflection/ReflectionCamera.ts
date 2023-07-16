import * as THREE from 'three';
import {Renderer} from "../Renderer";
import {Scene} from "../Scene";

export class ReflectionCamera {
    private readonly TARGET_SIZE: number = 256;

    private readonly NEAR: number = 0.05;

    private readonly FAR: number = 100;

    private readonly target: THREE.WebGLCubeRenderTarget;

    private readonly camera: THREE.CubeCamera;

    constructor() {
        this.target = new THREE.WebGLCubeRenderTarget(this.TARGET_SIZE, {
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            type: THREE.HalfFloatType,
        });

        this.camera = new THREE.CubeCamera(this.NEAR, this.FAR, this.target);
    }

    public getCamera(): THREE.CubeCamera {
        return this.camera;
    }

    public getTarget(): THREE.WebGLCubeRenderTarget {
        return this.target;
    }

    public getTexture(): THREE.CubeTexture {
        return this.target.texture;
    }

    public update(renderer: Renderer, scene: Scene): void {
        this.camera.update(renderer.getRender(), scene.getScene());
    }
}
