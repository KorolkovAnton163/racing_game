import {PhysicBody} from "./PhysicBody";
import {IPhysicBoxData} from "../../interfaces/physic/IPhysicBoxData";
import {ISLAND_SLEEPING} from "../../consts/physics";

export class PhysicBox extends PhysicBody {
    private world: Ammo.btDiscreteDynamicsWorld;

    private aux: Ammo.btTransform;

    private body: Ammo.btRigidBody;

    private static: boolean;

    private uuid: string;

    constructor(uuid: string, world: Ammo.btDiscreteDynamicsWorld, aux: Ammo.btTransform, data: IPhysicBoxData) {
        super();

        this.uuid = uuid;
        this.world = world;
        this.aux = aux;
        this.static = data.mass === 0;

        const geometry = new Ammo.btBoxShape(new Ammo.btVector3(data.w * 0.5, data.l * 0.5, data.h * 0.5));
        const transform = new Ammo.btTransform();

        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(data.pos.x, data.pos.y, data.pos.z));
        transform.setRotation(new Ammo.btQuaternion(data.quat.x, data.quat.y, data.quat.z, data.quat.w));

        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia(data.mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(data.mass, motionState, geometry, localInertia);

        this.body = new Ammo.btRigidBody(rbInfo);

        this.body.setFriction(data.friction);

        if (!this.static) {
            this.body.setActivationState(data.activation);
        }

        this.world.addRigidBody(this.body);
    }

    public update(dt: number, updated: Record<string, number[]>): void {
        if (this.static) {
            return;
        }

        const ms = this.body.getMotionState();

        if (ms) {
            ms.getWorldTransform(this.aux);
            const p = this.aux.getOrigin();
            const q = this.aux.getRotation();

            updated[this.uuid] = [p.x(), p.y(), p.z(), q.x(), q.y(), q.z(), q.w()];
        }
    }
}
