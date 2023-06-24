import * as THREE from 'three';
import {ILight} from "./interfaces/ILight";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

export class Scene {

    private readonly scene: THREE.Scene;

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa8def0);
        this.scene.fog = new THREE.Fog(this.scene.background, 1, 5000);
        this.scene.environment = new RGBELoader().load( '/assets/venice_sunset_1k.hdr' );
        this.scene.environment.mapping = THREE.EquirectangularReflectionMapping;
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
