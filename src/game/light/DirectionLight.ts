import * as THREE from 'three';
import {ILight} from "../interfaces/ILight";
import {Camera} from "../Camera";

export class DirectionLight implements ILight {

    protected readonly d = 20.0;

    protected light: THREE.DirectionalLight;

    protected helper: THREE.DirectionalLightHelper;

    public get position(): THREE.Vector3 {
        return this.light.position;
    }

    constructor() {
        this.light = new THREE.DirectionalLight(0xFFFFFF, 0.6);

        this.light.castShadow = true;
        this.light.shadow.mapSize.x = 4096.0;
        this.light.shadow.mapSize.y = 4096.0;
        this.light.shadow.camera.near = 0.1;
        this.light.shadow.camera.far = 1000.0;
        this.light.shadow.bias = -0.00001;
        this.light.shadow.radius = 0.5;
        this.light.shadow.blurSamples = 2.0;
        this.light.shadow.autoUpdate = true;
        this.light.shadow.needsUpdate = true;
        this.light.shadow.camera.left = -this.d;
        this.light.shadow.camera.right = this.d;
        this.light.shadow.camera.top = this.d;
        this.light.shadow.camera.bottom = -this.d;

        this.helper = new THREE.DirectionalLightHelper(this.light, 1.0);
    }

    public getLight(): THREE.DirectionalLight {
        return this.light;
    }

    public getHelper(): THREE.DirectionalLightHelper {
        return this.helper;
    }

    public getTarget(): THREE.Object3D {
        return this.light.target;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.light.position.set(x, y, z);
        this.light.target.position.set(x, y, z);
    }

    public setFromSphericalCoords(elevation: number, azimuth: number): void {
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);

        this.light.position.setFromSphericalCoords( 500, phi, theta );
    }

    public update(camera: Camera): void {
        const shift = new THREE.Vector3(10, 10, 5);
        this.light.target.position.set(camera.x, 0, camera.z);
        // this.light.position.copy(this.light.target.position).add(shift); //TODO: Возможно использовать для движения солнца
    }
}
