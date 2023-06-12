import * as THREE from 'three';
import {ILight} from "./interfaces/ILight";

export class Scene {

    private readonly scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa8def0);
        this.scene.fog = new THREE.Fog(0x4E7E94, 200, 750);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public addLight(light: ILight): void {
        this.scene.add(light.getLight());
    }

    public addObject(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    public remove(object: THREE.Object3D): void {
        this.scene.remove(object);
    }
}
