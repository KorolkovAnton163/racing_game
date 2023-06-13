import * as THREE from 'three';
import {Scene} from "./Scene";
import {Camera} from "./Camera";
import {Renderer} from "./Renderer";
import {DirectionLight} from "./light/DirectionLight";
import {AmbientLight} from "./light/AmbientLight";
import {HemisphereLight} from "./light/HemisphereLight";
import {Loader} from "./utils/Loader";
import {Sky} from "./models/Sky";
import {DebugController} from "./debug/DebugController";
import {ICarModel} from "./interfaces/ICarModel";
import {PlayerController} from "./controllers/PlayerController";
import {Cars} from "./consts/cars";
import {Car} from "./models/Car";
import {Rx7} from "./models/Rx7";
import {Savana} from "./models/Savana";
import {SilviaS13} from "./models/SilviaS13";
import {AmmoPhysics} from "./physics/AmmoPhysics";
import {Box} from "./models/Box";

export class Game {
    public clock: THREE.Clock;

    public scene: Scene;

    public camera: Camera;

    public renderer: Renderer;

    public sun: DirectionLight;

    public aLight: AmbientLight;

    public hLight: HemisphereLight;

    public sky: Sky;

    public physics: AmmoPhysics;

    private time: number = 0;

    private objectTimePeriod: number = 3;

    private timeNextSpawn: number = 0;

    private materialDynamic: THREE.MeshPhongMaterial;

    private materialStatic: THREE.MeshPhongMaterial;

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private models: Record<string, ICarModel> = {};

    private debugController: DebugController;

    private playerController: PlayerController;

    constructor() {
        this.scene = new Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.sun = new DirectionLight();
        this.aLight = new AmbientLight();
        this.hLight = new HemisphereLight();
        this.sky = new Sky();

        this.physics = new AmmoPhysics(new Worker('physics.worker.js'));

        this.materialDynamic = new THREE.MeshPhongMaterial( { color: 0xfca400 } );
        this.materialStatic = new THREE.MeshPhongMaterial( { color: 0x999999 } );

        this.debugController = new DebugController();
    }

    private bind(): void {
        window.addEventListener('resize', () => {
            this.camera.aspect(window.innerWidth / window.innerHeight);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    private async loadData(): Promise<void> {
        for (const car in Cars) {
            this.models[car] = {
                body: await Loader.loadModel(`${Cars[car]}/body.glb`),
                wheels: {
                    fl: await Loader.loadModel(`${Cars[car]}/wheel_f_l.glb`),
                    fr: await Loader.loadModel(`${Cars[car]}/wheel_f_r.glb`),
                    bl: await Loader.loadModel(`${Cars[car]}/wheel_b_l.glb`),
                    br: await Loader.loadModel(`${Cars[car]}/wheel_b_r.glb`)
                }
            };
        }
    }

    public async run(): Promise<void> {
        return this.physics.init().then(async () => {
            await this.loadData();

            this.timeNextSpawn = this.time + this.objectTimePeriod;

            //Графика
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRation(window.devicePixelRatio);
            this.renderer.enableShadowMap(true);

            this.camera.setPosition(-4.84, 4.39, -35.11);

            this.hLight.setPosition(0, 1000, 0);
            this.sun.setFromSphericalCoords(45.0, 180);
            this.scene.addLight(this.hLight);
            this.scene.addLight(this.sun);
            this.scene.addObject(this.sun.getTarget());
            this.scene.addObject(this.sun.getHelper());

            this.sky.setScalar(1000);
            this.scene.addObject(this.sky.getMesh());

            //Статические объекты
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 0.0, 0.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 0.0, 128.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 0.0, 256.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 0.0, 384.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 0.0, 512.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);

            new Box(this.scene, this.physics, new THREE.Vector3(64.0, 1.5, 0.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(64.0, 1.5, 128.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(64.0, 1.5, 256.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(64.0, 1.5, 384.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(64.0, 1.5, 512.0), this.ZERO_QUATERNION, 1, 3, 128, 0);

            new Box(this.scene, this.physics, new THREE.Vector3(-64.0, 1.5, 0.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(-64.0, 1.5, 128.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(-64.0, 1.5, 256.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(-64.0, 1.5, 384.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(-64.0, 1.5, 512.0), this.ZERO_QUATERNION, 1, 3, 128, 0);

            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 1.5, -64.0), this.ZERO_QUATERNION, 128, 3, 1, 0);
            new Box(this.scene, this.physics, new THREE.Vector3(0.0, 1.5, 576.0), this.ZERO_QUATERNION, 128, 3, 1, 0);

            const quaternion = new THREE.Quaternion(0, 0, 0, 1);
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18);
            new Box(this.scene, this.physics, new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0);

            // //Динамические обхекты
            const size = .75;
            const nw = 8;
            const nh = 6;
            for (let j = 0; j < nw; j++) {
                for (let i = 0; i < nh; i++) {
                    new Box(this.scene, this.physics, new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10), this.ZERO_QUATERNION, size, size, size, 100);
                }
            }

            //Машины
            const rx7 = new Rx7(this.scene, this.camera, this.physics, new THREE.Vector3(2, 1, -20));

            rx7.init(this.models['rx_7']);

            const savana = new Savana(this.scene, this.camera, this.physics, new THREE.Vector3(3, 1, -20));

            savana.init(this.models['savana']);

            const s13 = new SilviaS13(this.scene, this.camera, this.physics, new THREE.Vector3(1, 1, -20));

            s13.init(this.models['silvia_s13']);

            this.playerController = new PlayerController(
                this.models['evo_6'],
                this.scene,
                this.renderer,
                this.camera,
                this.physics,
            );

            document.body.appendChild(this.renderer.getElement());

            this.debugController.init(this.scene, this.sun);

            this.clock = new THREE.Clock();

            this.bind();
        });
    }

    public loop(): void {
        const delta = this.clock.getDelta();

        this.debugController.update(delta);

        this.playerController.update(delta);

        this.sun.update(this.camera);

        this.sky.update(this.sun);

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => {
            this.loop();
        });
    }
}
