import {PhysicBody} from "./PhysicBody";
import {
    IVehicleData,
    WHEEL_BACK_LEFT,
    WHEEL_BACK_RIGHT,
    WHEEL_FRONT_LEFT,
    WHEEL_FRONT_RIGHT
} from "../../interfaces/physic/IVehicleData";
import {DISABLE_DEACTIVATION} from "../../consts/physics";

export class PhysicVehicle extends PhysicBody {
    protected uuid: string;

    private world: Ammo.btDiscreteDynamicsWorld;

    private data: IVehicleData;

    private geometry: Ammo.btBoxShape;

    private body: Ammo.btRigidBody;

    private transform: Ammo.btTransform;

    private motionState: Ammo.btDefaultMotionState;

    private localInertia: Ammo.btVector3;

    private tuning: Ammo.btVehicleTuning;

    private rayCaster: Ammo.btDefaultVehicleRaycaster;

    private vehicle: Ammo.btRaycastVehicle;

    private readonly wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);

    private readonly wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    private steeringIncrement = 0.02; //скорость поворота колес //0.04
    private engineForce = 0; //можно ограничивать и регулировать набор скорости
    private vehicleSteering = 0; //поворот колес
    private breakingForce = 0; //сыла торможения

    private actions: Record<string, boolean> = {};

    constructor(uuid: string, world: Ammo.btDiscreteDynamicsWorld, data: IVehicleData) {
        super();

        this.uuid = uuid;

        this.world = world;

        this.data = data;

        this.geometry = new Ammo.btBoxShape(new Ammo.btVector3(
            this.data.chassisWidth * 0.5,
            this.data.chassisHeight * 0.5,
            this.data.chassisLength * 0.5
        ));

        this.transform = new Ammo.btTransform();

        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(this.data.position.x, this.data.position.y, this.data.position.z));
        this.transform.setRotation(new Ammo.btQuaternion(this.data.quaternion.x, this.data.quaternion.y, this.data.quaternion.z, this.data.quaternion.w));

        this.motionState = new Ammo.btDefaultMotionState(this.transform);
        this.localInertia = new Ammo.btVector3(0, 0, 0);

        this.geometry.calculateLocalInertia(data.massVehicle, this.localInertia);

        this.body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
            this.data.massVehicle,
            this.motionState,
            this.geometry,
            this.localInertia
        ));

        this.body.setActivationState(DISABLE_DEACTIVATION);

        this.world.addRigidBody(this.body);

        this.tuning = new Ammo.btVehicleTuning();
        this.rayCaster = new Ammo.btDefaultVehicleRaycaster(this.world);
        this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.body, this.rayCaster);

        this.vehicle.setCoordinateSystem(0, 1, 2);

        this.world.addAction(this.vehicle);

        this.createWheel(true, new Ammo.btVector3(data.wheelHalfTrackFront, data.wheelAxisHeightFront, data.wheelAxisPositionFront), data.wheelRadiusFront, data.wheelWidthFront, WHEEL_FRONT_LEFT);
        this.createWheel(true, new Ammo.btVector3(-data.wheelHalfTrackFront, data.wheelAxisHeightFront, data.wheelAxisPositionFront), data.wheelRadiusFront, data.wheelWidthFront, WHEEL_FRONT_RIGHT);
        this.createWheel(false, new Ammo.btVector3(-data.wheelHalfTrackBack, data.wheelAxisHeightBack, data.wheelAxisPositionBack), data.wheelRadiusBack, data.wheelWidthBack, WHEEL_BACK_LEFT);
        this.createWheel(false, new Ammo.btVector3(data.wheelHalfTrackBack, data.wheelAxisHeightBack, data.wheelAxisPositionBack), data.wheelRadiusBack, data.wheelWidthBack, WHEEL_BACK_RIGHT);
    }

    private createWheel(isFront: boolean, pos: Ammo.btVector3, radius: number, width: number, index: number): void {
        const wheelInfo = this.vehicle.addWheel(
            pos,
            this.wheelDirectionCS0,
            this.wheelAxleCS,
            this.data.suspensionRestLength,
            radius,
            this.tuning,
            isFront);

        wheelInfo.set_m_suspensionStiffness(this.data.suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(this.data.suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(this.data.suspensionCompression);
        wheelInfo.set_m_frictionSlip(this.data.friction);
        wheelInfo.set_m_rollInfluence(this.data.rollInfluence);
    }

    public setAction(actions: Record<string, boolean>): void {
        this.actions = actions;
    }

    public respawn(): void {
        const wt = this.vehicle.getChassisWorldTransform();
        const r = wt.getOrigin();
        const q = wt.getRotation();

        this.engineForce = 0;
        this.breakingForce = this.data.MAX_BREAKING_FORCE;
        this.vehicle.getChassisWorldTransform().setOrigin(r)
        this.vehicle.getChassisWorldTransform().setRotation(new Ammo.btQuaternion(0, q.y(),0, q.w()));
    }

    public update(dt: number, updated: Record<string, Float32Array>): void {
        const speed = this.vehicle.getCurrentSpeedKmHour();
        const rs = Number(Math.abs(speed).toFixed(1));

        this.breakingForce = 0;

        this.engineForce = 0;

        if (this.actions.break && rs > 0) {
            this.breakingForce = this.data.MAX_BREAKING_FORCE;
        } else {
            if (this.actions.acceleration) {
                if (speed < -1) {
                    this.breakingForce = this.data.MAX_BREAKING_FORCE;
                } else {
                    this.engineForce = this.data.MAX_ENGINE_FORCE;
                }
            }

            if (this.actions.braking) {
                if (speed > 1) {
                    this.breakingForce = this.data.MAX_BREAKING_FORCE;
                } else {
                    this.engineForce = -this.data.MAX_ENGINE_FORCE / 2;
                }
            }

            if (!this.actions.acceleration && !this.actions.braking && rs > 0) {
                this.breakingForce += this.data.MAX_BREAKING_FORCE * dt;
            }
        }

        if (this.actions.left) {
            if (this.vehicleSteering < this.data.steeringClamp) {
                this.vehicleSteering += this.steeringIncrement;
            }
        } else {
            if (this.actions.right) {
                if (this.vehicleSteering > -this.data.steeringClamp) {
                    this.vehicleSteering -= this.steeringIncrement;
                }
            } else {
                if (this.vehicleSteering < -this.steeringIncrement)
                    this.vehicleSteering += this.steeringIncrement;
                else {
                    if (this.vehicleSteering > this.steeringIncrement) {
                        this.vehicleSteering -= this.steeringIncrement;
                    } else {
                        this.vehicleSteering = 0;
                    }
                }
            }
        }

        if (this.engineForce > 0) {
            this.data.numberOfTransfers.forEach((arr: number[]) => {
                if (rs > arr[0] && rs < arr[1]) {
                    this.engineForce = this.data.TRANSMISSION_FORCE;
                    this.breakingForce = this.data.TRANSMISSION_BREAKING_FORCE;
                }
            });
        }

        //Ограничение скорости
        if ((this.actions.acceleration && rs > this.data.maxAccelerationSpeed) || (this.actions.braking && rs >= this.data.maxBrakingSpeed)) {
            this.engineForce = 0;
        }

        //газ на колесах
        this.data.forceWheels.forEach((wheel: number) => {
            this.vehicle.applyEngineForce(this.engineForce, wheel);
        });

        //тормаз на колесах
        if (this.actions.break) {
            this.vehicle.setBrake(this.breakingForce, WHEEL_BACK_LEFT);
            this.vehicle.setBrake(this.breakingForce, WHEEL_BACK_RIGHT);
        } else {
            this.vehicle.setBrake(this.breakingForce / 2, WHEEL_FRONT_LEFT);
            this.vehicle.setBrake(this.breakingForce / 2, WHEEL_FRONT_RIGHT);
            this.vehicle.setBrake(this.breakingForce, WHEEL_BACK_LEFT);
            this.vehicle.setBrake(this.breakingForce, WHEEL_BACK_RIGHT);
        }

        //поворот колес
        this.vehicle.setSteeringValue(this.vehicleSteering, WHEEL_FRONT_LEFT);
        this.vehicle.setSteeringValue(this.vehicleSteering, WHEEL_FRONT_RIGHT);

        const u: number[] = [];

        let tm, p, q, tw, pw, qw;

        tm = this.vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();

        u.push(p.x(), p.y(), p.z(), q.x(), q.y(), q.z(), q.w());

        for (let i = 0; i < this.vehicle.getNumWheels(); i++) {
            this.vehicle.updateWheelTransform(i, false);
            tw = this.vehicle.getWheelTransformWS(i);
            pw = tw.getOrigin();
            qw = tw.getRotation();

            u.push(pw.x(), pw.y(), pw.z(), qw.x(), qw.y(), qw.z(), qw.w());
        }

        u.push(rs);

        updated[this.uuid] = new Float32Array(u);
    }
}
