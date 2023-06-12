import * as THREE from 'three';

export class Camera {
    private readonly camera: THREE.PerspectiveCamera;

    public get rotation(): THREE.Euler {
        return this.camera.rotation;
    }

    public get x(): number {
        return this.camera.position.x;
    }

    public get y(): number {
        return this.camera.position.y;
    }

    public get z(): number {
        return this.camera.position.z;
    }

    public get rx(): number {
        return this.camera.rotation.x;
    }

    public get ry(): number {
        return this.camera.rotation.y;
    }

    public get rz(): number {
        return this.camera.rotation.z;
    }

    public get quaternion(): THREE.Quaternion {
        return this.camera.quaternion;
    }

    constructor() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.05, 1000);
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
    }

    public rotate(x: number, y: number, z: number): void {
        this.camera.rotation.set(x, y, z);
    }

    public aspect(aspect: number): void {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }

    public getWorldDirection(target: THREE.Vector3): THREE.Vector3 {
        return this.camera.getWorldDirection(target);
    }

    public subPosition(vec: THREE.Vector3): THREE.Vector3 {
        return this.camera.position.sub(vec);
    }
}