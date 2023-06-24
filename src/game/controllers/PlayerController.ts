import {ICarModel} from "../interfaces/ICarModel";
import {Scene} from "../Scene";
import {Camera} from "../Camera";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {Renderer} from "../Renderer";
import {Car} from "../models/Car";
import {SpeedometerComponent} from "../components/SpeedometerComponent";
import {Evo6} from "../models/Evo6";
import {AmmoPhysics} from "../physics/AmmoPhysics";

export class PlayerController {
    private readonly START_CAR_POSITION = new THREE.Vector3(0, 1, -20);

    private readonly KEYS_ACTIONS = {
        "KeyW":'acceleration',
        "KeyS":'braking',
        "KeyA":'left',
        "KeyD":'right',
        'Space': 'break',
    };

    private actions: Record<string, boolean> = {};

    private readonly controls: OrbitControls;

    private cameraTarget: THREE.Vector3 = new THREE.Vector3();

    private camera: Camera;

    private physics: AmmoPhysics;

    private car: Car;

    private speedometer: SpeedometerComponent;

    constructor(model: ICarModel, scene: Scene, renderer: Renderer, camera: Camera, physics: AmmoPhysics, cubeTexture: THREE.CubeTexture) {
        this.camera = camera;
        this.physics = physics;
        this.speedometer = new SpeedometerComponent();
        this.controls = new OrbitControls(camera.getCamera(), renderer.getElement());
        this.controls.enablePan = true;
        this.controls.enableZoom = false;
        this.controls.minDistance = 3.5;
        this.controls.maxDistance = 3.5;
        this.controls.maxPolarAngle = Math.PI / 1.7;

        this.car = new Evo6(scene, camera, this.physics, this.START_CAR_POSITION);

        this.car.init(model, cubeTexture);

        this.updateCameraTarget(this.START_CAR_POSITION, new THREE.Vector3(0.0,1.0,5.0));

        this.bind();
    }

    public update(delta: number): void {
        const cameraSubPosition = this.camera.subPosition(this.car.meshPosition);

        this.updateCameraTarget(this.car.meshPosition, cameraSubPosition);

        this.controls.target = this.cameraTarget;

        this.controls.update();

        this.speedometer.update(this.car.speed, this.actions);
    }

    private updateCameraTarget(translation: THREE.Vector3, offset: THREE.Vector3): void {
        this.camera.setPosition(
            translation.x + offset.x,
            translation.y + offset.y,
            translation.z + offset.z
        );

        this.camera.getCamera().applyQuaternion(this.car.meshQuaternion);

        this.cameraTarget.x = translation.x;
        this.cameraTarget.y = translation.y + 1;
        this.cameraTarget.z = translation.z;
    }

    private bind(): void {
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if(this.KEYS_ACTIONS[e.code]) {
                this.actions[this.KEYS_ACTIONS[e.code]] = true;

                e.preventDefault();
                e.stopPropagation();

                this.physics.vehicleAction(this.car.uuid(), this.actions);

                return false;
            }
        });

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.code === 'KeyR') {
                if (this.car.speed > 1) {
                    return;
                }

                this.physics.vehicleRespawn(this.car.uuid());

                return;
            }

            if(this.KEYS_ACTIONS[e.code]) {
                this.actions[this.KEYS_ACTIONS[e.code]] = false;

                e.preventDefault();
                e.stopPropagation();

                this.physics.vehicleAction(this.car.uuid(), this.actions);

                return false;
            }
        });
    }
}
