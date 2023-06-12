import * as THREE from "three";
import {GameObject} from "../models/GameObject";

export class DebugLines extends GameObject {
    protected mesh: THREE.LineSegments;

    constructor() {
        super();

        this.material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            vertexColors: true,
        });

        this.geometry = new THREE.BufferGeometry();

        this.mesh = new THREE.LineSegments(this.geometry, this.material);
    }

    public setVisible(visible: boolean): void {
        this.mesh.visible = visible;
    }

    public setGeometryAttribute(name: string, attribute: THREE.BufferAttribute): void {
        this.mesh.geometry.setAttribute(name, attribute);
    }
}
