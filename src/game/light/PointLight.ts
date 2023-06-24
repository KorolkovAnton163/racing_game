import * as THREE from 'three';
import {ILight} from "../interfaces/ILight";

export class PointLight implements ILight {
    private light: THREE.PointLight;

    private material: THREE.MeshStandardMaterial;

    private geometry: THREE.SphereGeometry;

    constructor() {
        this.material = new THREE.MeshStandardMaterial({
            emissive: 0xffffee,
            emissiveIntensity: 1,
            color: 0x000000
        });

        this.geometry = new THREE.SphereGeometry(0.02, 16, 8);

        this.light = new THREE.PointLight(0xffee88, 1, 100, 2);

        this.light.add(new THREE.Mesh( this.geometry, this.material));
        this.light.position.set( 0, 2, 0 );
        this.light.castShadow = true;
        this.light.power = 4;
    }

    public getLight(): THREE.Light {
        return this.light;
    }

}
