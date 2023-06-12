import * as THREE from "three";
import {Scene} from "../Scene";
import {Camera} from "../Camera";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ICarModel} from "../interfaces/ICarModel";

export abstract class Car {
    protected abstract TRANSMISSION_FORCE: number; //сила с которой машина наирает скорость при переключении передач

    protected abstract TRANSMISSION_BREAKING_FORCE: number;

    protected abstract chassisWidth: number; //длинна машины
    protected abstract chassisHeight: number; //высота маштны
    protected abstract chassisLength: number; //ширина машины
    protected abstract massVehicle: number; //вес машины

    //передние колеса
    protected abstract wheelWidthFront: number; //ширина
    protected abstract wheelAxisPositionFront: number; //Положение колос
    protected abstract wheelRadiusFront: number; //радиус
    protected abstract wheelHalfTrackFront: number; //вылет колес
    protected abstract wheelAxisHeightFront: number; //высота колес

    //задние колеса
    protected abstract wheelWidthBack: number; //ширина колес
    protected abstract wheelAxisPositionBack: number; //положение колос
    protected abstract wheelRadiusBack: number; //радиус колес
    protected abstract wheelHalfTrackBack: number; //вылет колес
    protected abstract wheelAxisHeightBack: number; //высота колес

    protected abstract friction: number; //трение
    protected abstract suspensionStiffness: number; //высота подвески
    protected abstract suspensionDamping: number; //жесткость подвески //было 2.3
    protected abstract suspensionCompression: number; //не понятно на что влиет //было 4.4
    protected abstract suspensionRestLength: number; //еще одна высота колес //было 0.6
    protected abstract rollInfluence: number; //сила отталкивания подвески //было 0.2

    protected abstract steeringClamp: number; //дорожный просвет //0.5

    protected abstract maxAccelerationSpeed: number;

    protected abstract maxBrakingSpeed: number;

    protected abstract numberOfTransfers: number[][];

    protected abstract forceWheels: number[];

    protected readonly FRONT_LEFT = 0;

    protected readonly FRONT_RIGHT = 1;

    protected readonly BACK_LEFT = 2;

    protected readonly BACK_RIGHT = 3;

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private readonly MAX_ENGINE_FORCE = 2000; //мкасимальная сила скоторой машина набирает //2000

    private readonly MAX_BREAKING_FORCE = 100; //масимальная сила торможения

    private readonly DISABLE_DEACTIVATION: number = 4;

    private readonly wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0);

    private readonly wheelAxleCS = new Ammo.btVector3(-1, 0, 0);

    private scene: Scene;

    private camera: Camera;

    private world: Ammo.btDiscreteDynamicsWorld;

    private position: THREE.Vector3;

    private mesh: THREE.Object3D;

    private geometry: Ammo.btBoxShape;

    private body: Ammo.btRigidBody;

    private transform: Ammo.btTransform;

    private motionState: Ammo.btDefaultMotionState;

    private localInertia: Ammo.btVector3;

    private tuning: Ammo.btVehicleTuning;

    private rayCaster: Ammo.btDefaultVehicleRaycaster;

    private vehicle: Ammo.btRaycastVehicle;

    private wheelMeshes: THREE.Object3D[] = [];

    private steeringIncrement = 0.02; //скорость поворота колес //0.04

    private engineForce = 0; //можно ограничивать и регулировать набор скорости
    private vehicleSteering = 0; //поворот колес
    private breakingForce = 0; //сыла торможения

    public get speed(): number {
        return this.vehicle.getCurrentSpeedKmHour();
    }

    public get meshPosition(): THREE.Vector3 {
        return this.mesh.position
    }

    public get meshQuaternion(): THREE.Quaternion {
        return this.mesh.quaternion;
    }

    constructor(scene: Scene, camera: Camera, world: Ammo.btDiscreteDynamicsWorld, position: THREE.Vector3) {
        this.scene = scene;
        this.camera = camera;
        this.world = world;
        this.position = position;
    }

    public init(model: ICarModel): void {
        this.geometry = new Ammo.btBoxShape(new Ammo.btVector3(
            this.chassisWidth * .5,
            this.chassisHeight * .5,
            this.chassisLength * .5
        ));

        this.transform = new Ammo.btTransform();

        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.z));
        this.transform.setRotation(new Ammo.btQuaternion(this.ZERO_QUATERNION.x, this.ZERO_QUATERNION.y, this.ZERO_QUATERNION.z, this.ZERO_QUATERNION.w));

        this.motionState = new Ammo.btDefaultMotionState(this.transform);
        this.localInertia = new Ammo.btVector3(0, 0, 0);

        this.geometry.calculateLocalInertia(this.massVehicle, this.localInertia);

        this.body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(
            this.massVehicle,
            this.motionState,
            this.geometry,
            this.localInertia
        ));

        this.body.setActivationState(this.DISABLE_DEACTIVATION);

        this.world.addRigidBody(this.body);

        this.mesh = model.body.scene.clone();

        this.mesh.traverse((object: THREE.Object3D) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.scene.addObject(this.mesh);

        this.tuning = new Ammo.btVehicleTuning();
        this.rayCaster = new Ammo.btDefaultVehicleRaycaster(this.world);
        this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.body, this.rayCaster);

        this.vehicle.setCoordinateSystem(0, 1, 2);

        this.world.addAction(this.vehicle);

        this.createWheel(true, model.wheels.fr, new Ammo.btVector3(this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisPositionFront), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_LEFT);
        this.createWheel(true, model.wheels.fl, new Ammo.btVector3(-this.wheelHalfTrackFront, this.wheelAxisHeightFront, this.wheelAxisPositionFront), this.wheelRadiusFront, this.wheelWidthFront, this.FRONT_RIGHT);
        this.createWheel(false, model.wheels.bl, new Ammo.btVector3(-this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_LEFT);
        this.createWheel(false, model.wheels.br, new Ammo.btVector3(this.wheelHalfTrackBack, this.wheelAxisHeightBack, this.wheelAxisPositionBack), this.wheelRadiusBack, this.wheelWidthBack, this.BACK_RIGHT);
    }

    public respawn(): void {
        const wt = this.vehicle.getChassisWorldTransform();
        const r = wt.getOrigin();
        const q = wt.getRotation();

        this.engineForce = 0;
        this.breakingForce = this.MAX_BREAKING_FORCE;
        this.vehicle.getChassisWorldTransform().setOrigin(r)
        this.vehicle.getChassisWorldTransform().setRotation(new Ammo.btQuaternion(0, q.y(),0, q.w()));
    }

    public update(dt: number, actions: Record<string, any>): void {
        const speed = this.vehicle.getCurrentSpeedKmHour();
        const rs = Number(Math.abs(speed).toFixed(1));

        this.breakingForce = 0;

        this.engineForce = 0;

        if (actions.break && rs > 0) {
            this.breakingForce = this.MAX_BREAKING_FORCE;
        } else {
            if (actions.acceleration) {
                if (speed < -1) {
                    this.breakingForce = this.MAX_BREAKING_FORCE;
                } else {
                    this.engineForce = this.MAX_ENGINE_FORCE;
                }
            }

            if (actions.braking) {
                if (speed > 1) {
                    this.breakingForce = this.MAX_BREAKING_FORCE;
                } else {
                    this.engineForce = -this.MAX_ENGINE_FORCE / 4;
                }
            }

            if (!actions.acceleration && !actions.braking && rs > 0) {
                this.breakingForce += this.MAX_BREAKING_FORCE * dt;
            }
        }

        if (actions.left) {
            if (this.vehicleSteering < this.steeringClamp) {
                this.vehicleSteering += this.steeringIncrement;
            }
        } else {
            if (actions.right) {
                if (this.vehicleSteering > -this.steeringClamp) {
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
            this.numberOfTransfers.forEach((arr: number[]) => {
                if (rs > arr[0] && rs < arr[1]) {
                    this.engineForce = this.TRANSMISSION_FORCE;
                    this.breakingForce = this.TRANSMISSION_BREAKING_FORCE;
                }
            });
        }

        //Ограничение скорости
        if ((actions.acceleration && rs > this.maxAccelerationSpeed) || (actions.braking && rs >= this.maxBrakingSpeed)) {
            this.engineForce = 0;
        }

        //газ на колесах
        this.forceWheels.forEach((wheel: number) => {
            this.vehicle.applyEngineForce(this.engineForce, wheel);
        });

        //тормаз на колесах
        this.vehicle.setBrake(this.breakingForce / 2, this.FRONT_LEFT);
        this.vehicle.setBrake(this.breakingForce / 2, this.FRONT_RIGHT);
        this.vehicle.setBrake(this.breakingForce, this.BACK_LEFT);
        this.vehicle.setBrake(this.breakingForce, this.BACK_RIGHT);

        //поворот колес
        this.vehicle.setSteeringValue(this.vehicleSteering, this.FRONT_LEFT);
        this.vehicle.setSteeringValue(this.vehicleSteering, this.FRONT_RIGHT);

        let tm, p, q, tw, pw, qw;

        for (let i = 0; i < this.vehicle.getNumWheels(); i++) {
            this.vehicle.updateWheelTransform(i, false);
            tw = this.vehicle.getWheelTransformWS(i);
            pw = tw.getOrigin();
            qw = tw.getRotation();

            this.wheelMeshes[i].position.set(pw.x(), pw.y(), pw.z());
            this.wheelMeshes[i].quaternion.set(qw.x(), qw.y(), qw.z(), qw.w());
        }

        tm = this.vehicle.getChassisWorldTransform();
        p = tm.getOrigin();
        q = tm.getRotation();

        this.mesh.position.set(p.x(), p.y(), p.z());
        this.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }

    private createWheel(isFront: boolean, wheel: GLTF, pos: Ammo.btVector3, radius: number, width: number, index: number): void {
        const wheelInfo = this.vehicle.addWheel(
            pos,
            this.wheelDirectionCS0,
            this.wheelAxleCS,
            this.suspensionRestLength,
            radius,
            this.tuning,
            isFront);

        wheelInfo.set_m_suspensionStiffness(this.suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(this.suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(this.suspensionCompression);
        wheelInfo.set_m_frictionSlip(this.friction);
        wheelInfo.set_m_rollInfluence(this.rollInfluence);

        this.wheelMeshes[index] = wheel.scene.clone();

        this.wheelMeshes[index].traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
            }
        });

        this.scene.addObject(this.wheelMeshes[index]);
    }
}
