import * as THREE from 'three';
import {SRGBColorSpace} from 'three';
import {Camera} from './Camera';
import {Scene} from './Scene';

export class Renderer {
    private renderer: THREE.WebGLRenderer;

    public get capabilities(): THREE.WebGLCapabilities {
        return this.renderer.capabilities;
    }

    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.useLegacyLights = true;
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    }

    public setSize(width: number, height: number): void {
        this.renderer.setSize(width, height);
    }

    public setPixelRation(ration: number): void {
        this.renderer.setPixelRatio(ration);
    }

    public enableShadowMap(enable: boolean): void {
        this.renderer.shadowMap.enabled = enable;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    public getElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public render(scene: Scene, camera: Camera): void {
        this.renderer.render(scene.getScene(), camera.getCamera());
    }

}
