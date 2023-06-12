import * as THREE from 'three';

export interface IObject {
    x: number;

    y: number;

    z: number;

    rx: number;

    ry: number;

    rz: number;

    getMesh(): THREE.Object3D;

    setPosition(x: number, y: number, z: number): void;

    rotate(x: number, y: number, z: number): void;
}
