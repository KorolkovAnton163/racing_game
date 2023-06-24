import * as THREE from 'three';
import {ILight} from "../interfaces/ILight";

export class HemisphereLight implements ILight {
    private readonly light: THREE.HemisphereLight;

    private readonly helper: THREE.HemisphereLightHelper;

    constructor() {
        this.light = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.6);
        this.helper = new THREE.HemisphereLightHelper(this.light, 10);
    }

    public getLight(): THREE.HemisphereLight {
        return this.light;
    }

    public getHelper(): THREE.HemisphereLightHelper {
        return this.helper;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.light.position.set(x, y, z);
    }

}
