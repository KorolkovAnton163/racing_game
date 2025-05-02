import * as THREE from 'three';
import * as POSTPROCESSING from 'postprocessing';
import {SRGBColorSpace} from 'three';
import {Camera} from './Camera';
import {Scene} from './Scene';
import { Sky } from "./models/Sky";
import MotionBlurEffect from "./effects/motion-blur/MotionBlurEffect";

export class Renderer {
    private readonly renderer: THREE.WebGLRenderer;

    private composer: POSTPROCESSING.EffectComposer;

    public get capabilities(): THREE.WebGLCapabilities {
        return this.renderer.capabilities;
    }

    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
    }

    public setupPostprocessing(scene: Scene, camera: Camera, sky: Sky): void {
        this.composer = new POSTPROCESSING.EffectComposer(this.renderer, {
            frameBufferType: THREE.HalfFloatType,
        });

        this.composer.addPass(new POSTPROCESSING.RenderPass(scene.getScene(), camera.getCamera()));

        // this.addSMAA(camera.getCamera());
    }

    private addSMAA(camera: THREE.Camera): void {
        const smaa = new POSTPROCESSING.SMAAEffect({
            preset: POSTPROCESSING.SMAAPreset.ULTRA,
            edgeDetectionMode: POSTPROCESSING.EdgeDetectionMode.DEPTH,
            predicationMode: POSTPROCESSING.PredicationMode.DEPTH,
        });

        const blur = new MotionBlurEffect();

        this.composer.addPass(new POSTPROCESSING.EffectPass(camera, smaa));
    }

    private addBloomEffect(camera: THREE.Camera): void {
        const bloom = new POSTPROCESSING.BloomEffect({
            intensity: 0.4,
        });

        this.composer.addPass(new POSTPROCESSING.EffectPass(camera, bloom));
    }

    private addDepthOfFieldEffect(camera: THREE.Camera): void {
        const depthOfFieldEffect = new POSTPROCESSING.DepthOfFieldEffect(camera, {
            focusDistance: 0.0,
            focalLength: 0.6,
            bokehScale: 2.0,
            height: 480
        });

        const depthEffect = new POSTPROCESSING.DepthEffect({
            blendFunction: POSTPROCESSING.BlendFunction.SKIP
        });

        const vignetteEffect = new POSTPROCESSING.VignetteEffect({
            eskil: false,
            offset: 0.35,
            darkness: 0.5
        });

        const cocTextureEffect = new POSTPROCESSING.TextureEffect({
            blendFunction: POSTPROCESSING.BlendFunction.SKIP,
            texture: depthOfFieldEffect.cocTexture
        });

        this.composer.addPass(new POSTPROCESSING.EffectPass(camera, depthOfFieldEffect, vignetteEffect, cocTextureEffect, depthEffect));
    }

    private addGodRaysEffect(camera: THREE.Camera, mesh: THREE.Mesh): void {
        const godRays = new POSTPROCESSING.GodRaysEffect(camera, mesh, {
            height: 480,
            kernelSize: POSTPROCESSING.KernelSize.SMALL,
            density: 0.2,
            decay: 0.2,
            weight: 1.0,
            exposure: 0.3,
            samples: 40,
            clampMax: 1.0
        });

        this.composer.addPass(new POSTPROCESSING.EffectPass(camera, godRays));
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
