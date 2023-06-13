import * as THREE from "three";
import {Scene} from "../Scene";
import {Camera} from "../Camera";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ICarModel} from "../interfaces/ICarModel";
import {AmmoPhysics} from "../physics/AmmoPhysics";
import {IGObject} from "./IGObject";
import {
    WHEEL_BACK_LEFT,
    WHEEL_BACK_RIGHT,
    WHEEL_FRONT_LEFT,
    WHEEL_FRONT_RIGHT
} from "../interfaces/physic/IVehicleData";

export abstract class Car implements IGObject {
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

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private scene: Scene;

    private camera: Camera;

    private physics: AmmoPhysics;

    private position: THREE.Vector3;

    private mesh: THREE.Object3D;

    private wheelMeshes: THREE.Object3D[] = [];

    private speedKmHour = 0;

    public get speed(): number {
        return this.speedKmHour;
    }

    public get meshPosition(): THREE.Vector3 {
        return this.mesh.position
    }

    public get meshQuaternion(): THREE.Quaternion {
        return this.mesh.quaternion;
    }

    constructor(scene: Scene, camera: Camera, physics: AmmoPhysics, position: THREE.Vector3) {
        this.scene = scene;
        this.camera = camera;
        this.physics = physics;
        this.position = position;
    }

    public uuid(): string {
        return this.mesh.uuid;
    }

    public init(model: ICarModel): void {
        this.mesh = model.body.scene.clone();

        this.mesh.traverse((object: THREE.Object3D) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        this.physics.addVehicle(this, {
            chassisWidth: this.chassisWidth,
            chassisHeight: this.chassisHeight,
            chassisLength: this.chassisLength,
            massVehicle: this.massVehicle,
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z,
            },
            quaternion: {
                x: this.ZERO_QUATERNION.x,
                y: this.ZERO_QUATERNION.y,
                z: this.ZERO_QUATERNION.z,
                w: this.ZERO_QUATERNION.w,
            },
            suspensionRestLength: this.suspensionRestLength,
            suspensionStiffness: this.suspensionStiffness,
            suspensionDamping: this.suspensionDamping,
            suspensionCompression: this.suspensionCompression,
            friction: this.friction,
            rollInfluence: this.rollInfluence,
            wheelHalfTrackFront: this.wheelHalfTrackFront,
            wheelAxisHeightFront: this.wheelAxisHeightFront,
            wheelAxisPositionFront: this.wheelAxisPositionFront,
            wheelHalfTrackBack: this.wheelHalfTrackBack,
            wheelAxisHeightBack: this.wheelAxisHeightBack,
            wheelAxisPositionBack: this.wheelAxisPositionBack,
            wheelRadiusFront: this.wheelRadiusFront,
            wheelRadiusBack: this.wheelRadiusBack,
            wheelWidthFront: this.wheelWidthFront,
            wheelWidthBack: this.wheelWidthBack,
            steeringClamp: this.steeringClamp,
            numberOfTransfers: this.numberOfTransfers,
            TRANSMISSION_FORCE: this.TRANSMISSION_FORCE,
            TRANSMISSION_BREAKING_FORCE: this.TRANSMISSION_BREAKING_FORCE,
            maxAccelerationSpeed: this.maxAccelerationSpeed,
            maxBrakingSpeed: this.maxBrakingSpeed,
            forceWheels: this.forceWheels,
        });

        this.scene.addObject(this.mesh);

        this.createWheel(model.wheels.fr, WHEEL_FRONT_LEFT);
        this.createWheel(model.wheels.fl, WHEEL_FRONT_RIGHT);
        this.createWheel(model.wheels.bl, WHEEL_BACK_LEFT);
        this.createWheel(model.wheels.br, WHEEL_BACK_RIGHT);
    }

    public update(updates: number[]): void {
        this.mesh.position.set(updates[0], updates[1], updates[2]);
        this.mesh.quaternion.set(updates[3], updates[4], updates[5], updates[6]);

        this.wheelMeshes[WHEEL_FRONT_LEFT].position.set(updates[7], updates[8], updates[9]);
        this.wheelMeshes[WHEEL_FRONT_LEFT].quaternion.set(updates[10], updates[11], updates[12], updates[13]);

        this.wheelMeshes[WHEEL_FRONT_RIGHT].position.set(updates[14], updates[15], updates[16]);
        this.wheelMeshes[WHEEL_FRONT_RIGHT].quaternion.set(updates[17], updates[18], updates[19], updates[20]);

        this.wheelMeshes[WHEEL_BACK_LEFT].position.set(updates[21], updates[22], updates[23]);
        this.wheelMeshes[WHEEL_BACK_LEFT].quaternion.set(updates[24], updates[25], updates[26], updates[27]);

        this.wheelMeshes[WHEEL_BACK_RIGHT].position.set(updates[28], updates[29], updates[30]);
        this.wheelMeshes[WHEEL_BACK_RIGHT].quaternion.set(updates[31], updates[32], updates[33], updates[34]);

        this.speedKmHour = updates[35];
    }

    private createWheel(wheel: GLTF, index: number): void {
        this.wheelMeshes[index] = wheel.scene.clone();

        this.wheelMeshes[index].traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
            }
        });

        this.scene.addObject(this.wheelMeshes[index]);
    }
}