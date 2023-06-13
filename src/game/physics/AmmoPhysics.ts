import * as THREE from 'three';
import * as Comlink from 'comlink'
import {Physics} from "./Physics";
import {IPhysicBoxData} from "../interfaces/physic/IPhysicBoxData";
import {IGObject} from "../models/IGObject";
import {IVehicleData} from "../interfaces/physic/IVehicleData";

export class AmmoPhysics {
    private worker: Worker;

    protected wrapper: any;

    private physics: Physics;

    public objects: Map<string, IGObject> = new Map();

    constructor(worker: Worker) {
        this.worker = worker;
    }

    public async init(): Promise<void> {
        const com: any = Comlink.wrap(this.worker);
        this.wrapper = await new com();

        await this.wrapper.init();

        this.physics = this.wrapper.physics;

        this.worker.addEventListener('message', (e) => {
            if (e.data.msg === 'ready') {
                console.log('ready');
            }

            if (e.data.msg === 'updates') {
                this.onUpdate(e.data.updates);
            }
        });
    }

    public addBox(object: IGObject, data: IPhysicBoxData): void {
        this.objects.set(object.uuid(), object);

        this.physics.addBox(object.uuid(), data);
    }

    public addVehicle(object: IGObject, data: IVehicleData): void {
        this.objects.set(object.uuid(), object);

        this.physics.addVehicle(object.uuid(), data);
    }

    public vehicleAction(uuid: string, action: Record<string, any>): void {
        this.physics.vehicleAction(uuid, action);
    }

    public vehicleRespawn(uuid: string): void {
        this.physics.vehicleRespawn(uuid);
    }

    private onUpdate(updates: Record<string, number[]>): void {
        for (let uuid in updates) {
            const o = this.objects.get(uuid);

            o.update(updates[uuid]);
        }
    }
}
