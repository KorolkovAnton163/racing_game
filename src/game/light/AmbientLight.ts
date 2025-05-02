import * as THREE from 'three';
import {ILight} from "../interfaces/ILight";

export class AmbientLight implements ILight {

    protected light: THREE.AmbientLight;

    constructor() {
        this.light = new THREE.AmbientLight(0xFFFFFF, 1.0);
    }

    public getLight(): THREE.AmbientLight {
        return this.light;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.light.position.set(x, y, z);
    }
}
