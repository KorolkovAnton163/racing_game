import * as THREE from 'three';
import {SRGBColorSpace} from 'three';
import {Camera} from './Camera';
import {Scene} from './Scene';
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {ShaderPass} from "three/examples/jsm/postprocessing/ShaderPass";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader";

export class Renderer {
    private readonly renderer: THREE.WebGLRenderer;

    private composer: EffectComposer;

    public get capabilities(): THREE.WebGLCapabilities {
        return this.renderer.capabilities;
    }

    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    public initEffects(scene: Scene, camera: Camera): void {
        const renderPass = new RenderPass(scene.getScene(), camera.getCamera());
        const fxaa = new ShaderPass(FXAAShader);

        fxaa.material['uniforms'].resolution.value.x = 1 / (window.innerWidth * window.devicePixelRatio);
        fxaa.material['uniforms'].resolution.value.y = 1 / (window.innerHeight * window.devicePixelRatio);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(fxaa);
    }

    public setSize(width: number, height: number): void {
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }

    public setPixelRation(ration: number): void {
        this.renderer.setPixelRatio(ration);
    }

    public enableShadowMap(enable: boolean): void {
        this.renderer.shadowMap.enabled = enable;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    public getRender(): THREE.WebGLRenderer {
        return this.renderer;
    }

    public getElement(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public render(): void {
        this.composer.render();
    }

}
