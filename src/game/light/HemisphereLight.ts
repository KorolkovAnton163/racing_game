import * as THREE from 'three';
import {ILight} from "../interfaces/ILight";

export class HemisphereLight implements ILight {
    private readonly light: THREE.HemisphereLight;

    constructor() {
        this.light = new THREE.HemisphereLight(0xFFFFFF, 0x444444);
    }

    public getLight(): THREE.HemisphereLight {
        return this.light;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.light.position.set(x, y, z);
    }

}
