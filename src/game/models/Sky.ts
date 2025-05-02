import * as THREE from "three";
import {SkyMesh} from "../meshs/SkyMesh";
import {DirectionLight} from "../light/DirectionLight";
import {Sun} from "./Sun";

export class Sky {
    protected mesh: SkyMesh

    constructor() {
        this.mesh = new SkyMesh();

        const uniforms = (this.mesh.material as THREE.ShaderMaterial).uniforms;

        uniforms['turbidity'].value = 0.1;
        uniforms['rayleigh'].value = 0.3;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;
    }

    public setScalar(scalar: number): void {
        this.mesh.scale.setScalar(scalar);
    }

    public getMesh(): THREE.Mesh {
        return this.mesh;
    }

    public update(sun: Sun): void {
        (this.mesh.material as THREE.ShaderMaterial).uniforms['sunPosition'].value.copy(sun.mainLight.position);
    }
}
