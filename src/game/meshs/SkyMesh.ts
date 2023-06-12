import * as THREE from "three";
import {SKY_SHADERS} from "../consts/sky";

export class SkyMesh extends THREE.Mesh {
    public isSky: boolean = true;

    constructor() {
        super(new THREE.BoxGeometry( 1, 1, 1 ), new THREE.ShaderMaterial({
            name: 'SkyShader',
            fragmentShader: SKY_SHADERS.fragmentShader,
            vertexShader: SKY_SHADERS.vertexShader,
            uniforms: THREE.UniformsUtils.clone(SKY_SHADERS.uniforms),
            side: THREE.BackSide,
            depthWrite: false
        }));
    }
}
