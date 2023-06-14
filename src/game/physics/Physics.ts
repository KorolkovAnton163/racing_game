import {PhysicBody} from "./bodies/PhysicBody";
import {PhysicBox} from "./bodies/PhysicBox";
import {IPhysicBoxData} from "../interfaces/physic/IPhysicBoxData";
import {IVehicleData} from "../interfaces/physic/IVehicleData";
import {PhysicVehicle} from "./bodies/PhysicVehicle";

export class Physics {
    private collisionConfiguration: Ammo.btDefaultCollisionConfiguration;

    private dispatcher: Ammo.btCollisionDispatcher;

    private broadphase: Ammo.btDbvtBroadphase;

    private solver: Ammo.btSequentialImpulseConstraintSolver;

    private world: Ammo.btDiscreteDynamicsWorld;

    private TRANSFORM_AUX: Ammo.btTransform;

    private bodies: Map<string, PhysicBody> = new Map();

    constructor() {
        this.TRANSFORM_AUX = new Ammo.btTransform();

        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
        this.world.setGravity(new Ammo.btVector3( 0, -9.82, 0 ));
    }

    public update(delta: number): Record<string, number[]> {
        const updates: Record<string, number[]> = {};
        const dt = delta / 1000;

        this.world.stepSimulation(dt, 5, 1 / 60);

        this.bodies.forEach((b: PhysicBody) => {
            b.update(dt, updates);
        });

        return updates
    }

    public addBox(uuid: string, data: IPhysicBoxData): void {
        this.bodies.set(uuid, new PhysicBox(uuid, this.world, this.TRANSFORM_AUX, data));
    }

    public addVehicle(uuid: string, data: IVehicleData): void {
        this.bodies.set(uuid, new PhysicVehicle(uuid, this.world, data));
    }

    public vehicleAction(uuid: string, action: Record<string, boolean>): void {
        const body = this.bodies.get(uuid);

        if (body instanceof PhysicVehicle) {
            body.setAction(action);
        }
    }

    public vehicleRespawn(uuid: string): void {
        const body = this.bodies.get(uuid);

        if (body instanceof PhysicVehicle) {
            body.respawn();
        }
    }
}
