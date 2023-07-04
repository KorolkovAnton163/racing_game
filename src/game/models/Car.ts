import * as THREE from "three";
import {Scene} from "../Scene";
import {Camera} from "../Camera";
import {GLTF} from "three/examples/jsm/loaders/GLTFLoader";
import {ICarModel} from "../interfaces/ICarModel";
import {AmmoPhysics} from "../physics/AmmoPhysics";
import {IGameObject} from "../interfaces/IGameObject";
import {
    WHEEL_BACK_LEFT,
    WHEEL_BACK_RIGHT,
    WHEEL_FRONT_LEFT,
    WHEEL_FRONT_RIGHT
} from "../interfaces/physic/IVehicleData";
import Materials, {MaterialType} from "../utils/Materials";

export abstract class Car implements IGameObject {
    protected abstract MAX_ENGINE_FORCE: number; //мкасимальная сила скоторой машина набирает скорость //2000

    protected abstract MAX_BREAKING_FORCE: number; //сала торможения //100

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

    protected abstract friction: number; //трение (влиет на управляемсто в поворотах)
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

    protected abstract materials: Record<string, { type: MaterialType, color: number, params?: THREE.MeshStandardMaterialParameters }>;

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private scene: Scene;

    private camera: Camera;

    private physics: AmmoPhysics;

    private position: THREE.Vector3;

    private mesh: THREE.Object3D;

    private wheelMeshes: THREE.Object3D[] = [];

    private debugMesh: THREE.Object3D;

    private debugWheelMeshes: THREE.Object3D[] = [];

    private speedKmHour = 0;

    protected cubeTexture: THREE.CubeTexture;

    public get object(): THREE.Object3D {
        return this.mesh;
    }

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

    public init(model: ICarModel, cubeTexture: THREE.CubeTexture): void {
        this.mesh = model.body.scene.clone();
        this.cubeTexture = cubeTexture;

        this.mesh.traverse((object: THREE.Object3D) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;

                if (object.material instanceof THREE.Material) {
                    const material = this.materials[object.material.name];

                    if (material) {
                        object.material = Materials.create(material.type, material.color, object.material.name, material.params);
                    }
                }
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
            MAX_ENGINE_FORCE: this.MAX_ENGINE_FORCE,
            MAX_BREAKING_FORCE: this.MAX_BREAKING_FORCE,
            TRANSMISSION_FORCE: this.TRANSMISSION_FORCE,
            TRANSMISSION_BREAKING_FORCE: this.TRANSMISSION_BREAKING_FORCE,
            maxAccelerationSpeed: this.maxAccelerationSpeed,
            maxBrakingSpeed: this.maxBrakingSpeed,
            forceWheels: this.forceWheels,
        });

        this.debugMesh = new THREE.Mesh(new THREE.BoxGeometry(
            this.chassisWidth,
            this.chassisHeight,
            this.chassisLength, 1, 1, 1),
            new THREE.MeshPhongMaterial( { color :0x990000, wireframe: true }),
        );

        this.scene.addObject(this.debugMesh);
        this.scene.addObject(this.mesh);

        this.createWheel(model.wheels.fr, WHEEL_FRONT_LEFT);
        this.createWheel(model.wheels.fl, WHEEL_FRONT_RIGHT);
        this.createWheel(model.wheels.bl, WHEEL_BACK_LEFT);
        this.createWheel(model.wheels.br, WHEEL_BACK_RIGHT);
    }

    public update(updates: Float32Array): void {
        this.mesh.position.set(updates[0], updates[1], updates[2]);
        this.mesh.quaternion.set(updates[3], updates[4], updates[5], updates[6]);

        this.debugMesh.position.set(updates[0], updates[1], updates[2]);
        this.debugMesh.quaternion.set(updates[3], updates[4], updates[5], updates[6]);

        this.wheelMeshes[WHEEL_FRONT_LEFT].position.set(updates[7], updates[8], updates[9]);
        this.wheelMeshes[WHEEL_FRONT_LEFT].quaternion.set(updates[10], updates[11], updates[12], updates[13]);

        this.wheelMeshes[WHEEL_FRONT_RIGHT].position.set(updates[14], updates[15], updates[16]);
        this.wheelMeshes[WHEEL_FRONT_RIGHT].quaternion.set(updates[17], updates[18], updates[19], updates[20]);

        this.wheelMeshes[WHEEL_BACK_LEFT].position.set(updates[21], updates[22], updates[23]);
        this.wheelMeshes[WHEEL_BACK_LEFT].quaternion.set(updates[24], updates[25], updates[26], updates[27]);

        this.wheelMeshes[WHEEL_BACK_RIGHT].position.set(updates[28], updates[29], updates[30]);
        this.wheelMeshes[WHEEL_BACK_RIGHT].quaternion.set(updates[31], updates[32], updates[33], updates[34]);

        this.debugWheelMeshes[WHEEL_FRONT_LEFT].position.set(updates[7], updates[8], updates[9]);
        this.debugWheelMeshes[WHEEL_FRONT_LEFT].quaternion.set(updates[10], updates[11], updates[12], updates[13]);

        this.debugWheelMeshes[WHEEL_FRONT_RIGHT].position.set(updates[14], updates[15], updates[16]);
        this.debugWheelMeshes[WHEEL_FRONT_RIGHT].quaternion.set(updates[17], updates[18], updates[19], updates[20]);

        this.debugWheelMeshes[WHEEL_BACK_LEFT].position.set(updates[21], updates[22], updates[23]);
        this.debugWheelMeshes[WHEEL_BACK_LEFT].quaternion.set(updates[24], updates[25], updates[26], updates[27]);

        this.debugWheelMeshes[WHEEL_BACK_RIGHT].position.set(updates[28], updates[29], updates[30]);
        this.debugWheelMeshes[WHEEL_BACK_RIGHT].quaternion.set(updates[31], updates[32], updates[33], updates[34]);

        this.speedKmHour = updates[35];
    }

    private createWheel(wheel: GLTF, index: number): void {
        this.wheelMeshes[index] = wheel.scene.clone();

        this.wheelMeshes[index].traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
            }
        });

        this.createDebugWheel(index);

        this.scene.addObject(this.wheelMeshes[index]);
    }

    private createDebugWheel(index: number): void {
        const radius = index === WHEEL_FRONT_LEFT || index === WHEEL_FRONT_RIGHT ? this.wheelRadiusFront : this.wheelRadiusBack;
        const width = index === WHEEL_FRONT_LEFT || index === WHEEL_FRONT_RIGHT ? this.wheelWidthFront : this.wheelWidthBack;
        const cylinder = new THREE.CylinderGeometry(radius, radius, width, 24, 1);

        cylinder.rotateZ(Math.PI / 2);

        this.debugWheelMeshes[index] = new THREE.Mesh(
            cylinder,
            new THREE.MeshPhongMaterial( { color :0x990000, wireframe: true })
        );

        this.scene.addObject(this.debugWheelMeshes[index]);
    }
}
