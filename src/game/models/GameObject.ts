import * as THREE from 'three';
import { IObject } from "../interfaces/IObject";
import { Material, Object3D } from "three";
import { BufferGeometry } from "three/src/core/BufferGeometry";

export class GameObject implements IObject {
    protected uuid: string = THREE.MathUtils.generateUUID();

    protected mesh: Object3D;

    protected geometry: BufferGeometry;

    protected material: Material;

    public get position(): THREE.Vector3 {
        return this.mesh.position;
    }

    public get rotation(): THREE.Euler {
        return this.mesh.rotation;
    }

    public get quaternion(): THREE.Quaternion {
        return this.mesh.quaternion;
    }

    public get x(): number {
        return this.mesh.position.x;
    }

    public get y(): number {
        return this.mesh.position.y;
    }

    public get z(): number {
        return this.mesh.position.z;
    }

    public get rx(): number {
        return this.mesh.rotation.x;
    }

    public get ry(): number {
        return this.mesh.rotation.y;
    };

    public get rz(): number {
        return this.mesh.rotation.z;
    }

    public getMesh(): Object3D {
        return this.mesh;
    }

    public setPosition(x: number, y: number, z: number): void {
        this.mesh.position.set(x, y, z);
    }

    public setScale(x: number, y: number, z: number): void {
        this.mesh.scale.set(x, y, z);
    }

    public rotate(x: number, y: number, z: number): void {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'XYZ'));
        this.mesh.rotation.setFromQuaternion(q);
    }
}
