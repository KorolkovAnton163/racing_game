import {PhysicBody} from "./PhysicBody";
import {IPhysicBoxData} from "../../interfaces/physic/IPhysicBoxData";

export class PhysicBox extends PhysicBody {
    private world: Ammo.btDiscreteDynamicsWorld;

    private aux: Ammo.btTransform;

    private body: Ammo.btRigidBody;

    private updates = new Float32Array([
        0.0, 0.0, 0.0,
        0.0, 0.0, 0.0, 0.0,
    ]);

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

    public update(dt: number): Float32Array {
        if (this.static) {
            return this.updates;
        }

        const ms = this.body.getMotionState();

        if (ms) {
            ms.getWorldTransform(this.aux);
            const p = this.aux.getOrigin();
            const q = this.aux.getRotation();

            this.updates[0] = p.x();
            this.updates[1] = p.y();
            this.updates[2] = p.z();
            this.updates[3] = q.x();
            this.updates[4] = q.y();
            this.updates[5] = q.z();
            this.updates[6] = q.w();
        }

        return this.updates;
    }
}
