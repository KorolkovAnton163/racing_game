import * as THREE from "three";
import {SkyMesh} from "../meshs/SkyMesh";
import {DirectionLight} from "../light/DirectionLight";

export class Sky {
    protected mesh: SkyMesh

    constructor() {
        this.mesh = new SkyMesh();

        const uniforms = (this.mesh.material as THREE.ShaderMaterial).uniforms;

        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 2;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;
    }

    public setScalar(scalar: number): void {
        this.mesh.scale.setScalar(scalar);
    }

    public getMesh(): THREE.Object3D {
        return this.mesh;
    }

    public update(sun: DirectionLight): void {
        (this.mesh.material as THREE.ShaderMaterial).uniforms['sunPosition'].value.copy(sun.position);
    }
}
