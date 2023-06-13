import * as THREE from "three";
import {Scene} from "../Scene";
import {AmmoPhysics} from "../physics/AmmoPhysics";
import {IGObject} from "./IGObject";

export class Box implements IGObject {
    private scene: Scene;

    private physics: AmmoPhysics;

    private mesh: THREE.Object3D;

    private materialDynamic = new THREE.MeshPhongMaterial( { color: 0xfca400 } );

    private materialStatic = new THREE.MeshPhongMaterial( { color: 0x999999 } );

    constructor(
        scene: Scene,
        physics: AmmoPhysics,
        pos: THREE.Vector3,
        quat: THREE.Quaternion,
        w: number,
        l: number,
        h: number,
        mass: number = 0,
        friction: number = 1
    ) {
        const material = mass > 0 ? this.materialDynamic : this.materialStatic;
        const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);

        this.scene = scene;
        this.physics = physics;
        this.mesh = new THREE.Mesh(shape, material);

        this.mesh.position.copy(pos);
        this.mesh.quaternion.copy(quat);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.physics.addBox(this, {
            pos: {
                x: pos.x,
                y: pos.y,
                z: pos.z,
            },
            quat: {
                x: quat.x,
                y: quat.y,
                z: quat.z,
                w: quat.w,
            },
            w: w,
            l: l,
            h: h,
            mass: mass,
            friction: friction,
        });

        this.scene.addObject(this.mesh);
    }

    public uuid(): string {
        return this.mesh.uuid;
    }

    public update(updates: number[]): void {
        this.mesh.position.set(updates[0], updates[1], updates[2]);
        this.mesh.quaternion.set(updates[3], updates[4], updates[5], updates[6]);
    }
}
