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
import {Rx7} from "./models/Rx7";
import {Savana} from "./models/Savana";
import {SilviaS13} from "./models/SilviaS13";
import {AmmoPhysics} from "./physics/AmmoPhysics";
import {Box} from "./models/Box";
import {PointLight} from "./light/PointLight";
import {Texture} from "./utils/Texture";
import {DISABLE_DEACTIVATION, ISLAND_SLEEPING} from "./consts/physics";
import {ReflectionCamera} from "./reflection/ReflectionCamera";
import {Buildings} from "./consts/buildings";
import {Clouds} from "./models/Clouds";

export class Game {
    public clock: THREE.Clock;

    public scene: Scene;

    public camera: Camera;

    public renderer: Renderer;

    public sun: DirectionLight;

    public aLight: AmbientLight;

    public hLight: HemisphereLight;

    public pLight: PointLight;

    public sky: Sky;

    public clouds: Clouds;

    public physics: AmmoPhysics;

    public reflectionCamera: ReflectionCamera;

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private models: Record<string, ICarModel> = {};

    private buildings: Map<string, THREE.Object3D> = new Map();

    private debugController: DebugController;

    private playerController: PlayerController;

    private textures: { cube: THREE.CubeTexture, cloud: THREE.Texture } = {
        cube: new THREE.CubeTexture(),
        cloud: new THREE.Texture(),
    };

    constructor() {
        this.scene = new Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.sun = new DirectionLight();
        this.aLight = new AmbientLight();
        this.hLight = new HemisphereLight();
        this.pLight = new PointLight();
        this.sky = new Sky();
        this.clouds = new Clouds();
        this.reflectionCamera = new ReflectionCamera();

        this.physics = new AmmoPhysics(new Worker('physics.worker.js'));

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

        for (const building in Buildings) {
            this.buildings.set(building, await Loader.loadModel(`${Buildings[building]}`));
        }

        this.textures.cube = await Texture.loadCube([
            'assets/px.png', 'assets/nx.png',
            'assets/px.png', 'assets/ny.png',
            'assets/pz.png', 'assets/nz.png',
        ]);

        this.textures.cloud = await Texture.load('assets/cloud.png');
    }

    private createTestMap(): void {
        [
            [14.0, 10.0, -4.0, 0.0, 0.0, 0.0, 1.0, 9.0, 20.0, 55.0, 0.0, 0.0],
            [31.0, 10.0, 19.0, 0.0, 0.0, 0.0, 1.0, 25.0, 20.0, 9.0, 0.0, 0.0],
            [-14.0, 9.0, 0.0, 0.0, 0.0, 0.0, 1.0, 9.0, 18.0, 39.0, 0.0, 0.0],
            [14.6, 10.0, 68.5, 0.0, 0.0, 0.0, 1.0, 9.0, 20.0, 40.0, 0.0, 0.0],
            [26.0, 10.0, 44.6, 0.0, 0.0, 0.0, 1.0, 32.0, 20.0, 9.0, 0.0, 0.0],
            [59.0, 6.0, 77.0, 0.0, 0.0, 0.0, 1.0, 9.0, 12.0, 38.0, 0.0, 0.0],
        ].forEach((box: number[]) => {
            new Box(this.scene, this.physics,
                new THREE.Vector3(box[0], box[1], box[2]),
                new THREE.Quaternion(box[3], box[4], box[5], box[6]),
                box[7], box[8], box[9], box[10], box[11]);
        });
    }

    public async run(): Promise<void> {
        return this.physics.init().then(async () => {
            await this.loadData();

            //Графика
            this.renderer.initEffects(this.scene, this.camera);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRation(1);
            this.renderer.enableShadowMap(true);

            this.camera.setPosition(-4.84, 4.39, -35.11);

            this.hLight.setPosition(0, 50, 0);
            this.sun.setFromSphericalCoords(45.0, 180);
            this.scene.addLight(this.hLight);
            this.scene.addLight(this.sun);
            this.scene.addObject(this.sun.getTarget());
            this.scene.addObject(this.sun.getHelper());
            this.scene.addObject(this.hLight.getHelper());

            this.sky.setScalar(2000);
            this.scene.addObject(this.sky.getMesh());

            this.clouds.init(this.textures.cloud);
            this.scene.addObject(this.clouds.mesh);

            this.scene.addObject(this.reflectionCamera.getCamera());

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
                    new Box(
                        this.scene,
                        this.physics,
                        new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10),
                        this.ZERO_QUATERNION, size, size, size, 100, 1, DISABLE_DEACTIVATION);
                }
            }

            new Box(
                this.scene,
                this.physics,
                new THREE.Vector3(0.0, 3.0, -18.0),
                this.ZERO_QUATERNION, 0.1, 5.0, 0.1, 300, 1, ISLAND_SLEEPING);

            this.createTestMap();

            //Машины
            const rx7 = new Rx7(this.scene, this.camera, this.physics, new THREE.Vector3(2, 1, -20));

            rx7.init(this.models['rx_7'], this.textures.cube);

            const savana = new Savana(this.scene, this.camera, this.physics, new THREE.Vector3(3, 1, -20));

            savana.init(this.models['savana'], this.textures.cube);

            const s13 = new SilviaS13(this.scene, this.camera, this.physics, new THREE.Vector3(1, 1, -20));

            s13.init(this.models['silvia_s13'], this.textures.cube);

            this.playerController = new PlayerController(
                this.models['evo_6'],
                this.scene,
                this.renderer,
                this.camera,
                this.physics,
                this.textures.cube,
            );

            document.getElementById('canvas').appendChild(this.renderer.getElement());

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

        this.clouds.update(delta);

        this.reflectionCamera.update(this.renderer, this.scene);

        this.renderer.render();

        requestAnimationFrame(() => {
            this.loop();
        });
    }
}
