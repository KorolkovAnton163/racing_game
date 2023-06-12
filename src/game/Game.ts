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

export class Game {
    public clock: THREE.Clock;

    public scene: Scene;

    public camera: Camera;

    public renderer: Renderer;

    public sun: DirectionLight;

    public aLight: AmbientLight;

    public hLight: HemisphereLight;

    public sky: Sky;

    private syncList: ((dt: number) => void)[] = [];

    private time: number = 0;

    private objectTimePeriod: number = 3;

    private timeNextSpawn: number = 0;

    private materialDynamic: THREE.MeshPhongMaterial;

    private materialStatic: THREE.MeshPhongMaterial;

    private TRANSFORM_AUX: Ammo.btTransform;

    private readonly DISABLE_DEACTIVATION: number = 4;

    private readonly ZERO_QUATERNION: THREE.Quaternion = new THREE.Quaternion(0, 0, 0, 1);

    private collisionConfiguration: Ammo.btDefaultCollisionConfiguration;

    private dispatcher: Ammo.btCollisionDispatcher;

    private broadphase: Ammo.btDbvtBroadphase;

    private solver: Ammo.btSequentialImpulseConstraintSolver;

    private physicsWorld: Ammo.btDiscreteDynamicsWorld;

    private models: Record<string, ICarModel> = {};

    private debugController: DebugController;

    private playerController: PlayerController;

    private cars: Car[] = [];

    constructor() {
        this.scene = new Scene();
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.sun = new DirectionLight();
        this.aLight = new AmbientLight();
        this.hLight = new HemisphereLight();
        this.sky = new Sky();

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

    private createBox(pos: THREE.Vector3, quat: THREE.Quaternion, w: number, l: number, h: number, mass: number = 0, friction: number = 1): void {
        const material = mass > 0 ? this.materialDynamic : this.materialStatic;
        const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);
        const geometry = new Ammo.btBoxShape(new Ammo.btVector3(w * 0.5, l * 0.5, h * 0.5));

        const mesh = new THREE.Mesh(shape, material);

        mesh.position.copy(pos);
        mesh.quaternion.copy(quat);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.addObject(mesh);

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        const motionState = new Ammo.btDefaultMotionState(transform);

        const localInertia = new Ammo.btVector3(0, 0, 0);
        geometry.calculateLocalInertia(mass, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, geometry, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        body.setFriction(friction);
        // body.setRestitution(.9);
        // body.setDamping(0.2, 0.2);

        this.physicsWorld.addRigidBody(body);

        if (mass > 0) {
            body.setActivationState(this.DISABLE_DEACTIVATION);
            // Sync physics and graphics

            this.syncList.push((dt: number) => {
                const ms = body.getMotionState();

                if (ms) {
                    ms.getWorldTransform(this.TRANSFORM_AUX);
                    const p = this.TRANSFORM_AUX.getOrigin();
                    const q = this.TRANSFORM_AUX.getRotation();
                    mesh.position.set(p.x(), p.y(), p.z());
                    mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
                }
            });
        }
    }

    private createStaticBox(pos: THREE.Vector3, quat: THREE.Quaternion, w: number, l: number, h: number, mass: number = 0, friction: number = 1): void {
        const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);

        const triangleMeshTerrain = new Ammo.btTriangleMesh();

        let vertex1, vertex2, vertex3, vertex4;

        // for (let i = -250; i < 250; i+=10) {
        //     for (let j = -250; i < 250; i+=10) {
        //         vertex1 = new Ammo.btVector3(i, 0.0, j);
        //         vertex2 = new Ammo.btVector3(i + 10, 0.0, j);
        //         vertex3 = new Ammo.btVector3(i + 10.0, 0.0, j + 10.0);
        //         vertex4 = new Ammo.btVector3(i, 0.0, j + 10.0);
        //
        //         triangleMeshTerrain.addTriangle(vertex1, vertex2, vertex3);
        //         triangleMeshTerrain.addTriangle(vertex1, vertex3, vertex4);
        //     }
        // }

        for (let i = -30; i < 10; i+=1) {
            for (let j = -30; i < 30; i+=1) {
                vertex1 = new Ammo.btVector3(i, 0.0, j);
                vertex2 = new Ammo.btVector3(i + 30, 0.0, j);
                vertex3 = new Ammo.btVector3(i + 30.0, 0.0, j + 30.0);
                vertex4 = new Ammo.btVector3(i, 0.0, j + 30.0);

                triangleMeshTerrain.addTriangle(vertex1, vertex2, vertex3);
                triangleMeshTerrain.addTriangle(vertex1, vertex3, vertex4);
            }
        }

        const collisionShapeTerrain = new Ammo.btBvhTriangleMeshShape(triangleMeshTerrain, true);

        const motionState = new Ammo.btDefaultMotionState(
            new Ammo.btTransform(
                new Ammo.btQuaternion(0, 0, 0, 1),
                new Ammo.btVector3(0, 0, 0)
            )
        );

        const btRigidBodyConstructionInfo = new Ammo.btRigidBodyConstructionInfo(0.0, motionState, collisionShapeTerrain, new Ammo.btVector3(0, 0, 0));
        const rigidBodyTerrain = new Ammo.btRigidBody(btRigidBodyConstructionInfo);

        rigidBodyTerrain.setFriction(0.9);

        this.physicsWorld.addRigidBody(rigidBodyTerrain);
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
        return Ammo().then(async (api) => {
            await this.loadData();

            this.TRANSFORM_AUX = new Ammo.btTransform();

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

            //Физика
            this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
            this.broadphase = new Ammo.btDbvtBroadphase();
            this.solver = new Ammo.btSequentialImpulseConstraintSolver();
            this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration);
            this.physicsWorld.setGravity(new Ammo.btVector3( 0, -9.82, 0 ));

            //Статические объекты
            this.createBox(new THREE.Vector3(0.0, 0.0, 0.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            this.createBox(new THREE.Vector3(0.0, 0.0, 128.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            this.createBox(new THREE.Vector3(0.0, 0.0, 256.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            this.createBox(new THREE.Vector3(0.0, 0.0, 384.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);
            this.createBox(new THREE.Vector3(0.0, 0.0, 512.0), this.ZERO_QUATERNION, 128, 1, 128, 0, 2);

            this.createBox(new THREE.Vector3(64.0, 1.5, 0.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(64.0, 1.5, 128.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(64.0, 1.5, 256.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(64.0, 1.5, 384.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(64.0, 1.5, 512.0), this.ZERO_QUATERNION, 1, 3, 128, 0);

            this.createBox(new THREE.Vector3(-64.0, 1.5, 0.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(-64.0, 1.5, 128.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(-64.0, 1.5, 256.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(-64.0, 1.5, 384.0), this.ZERO_QUATERNION, 1, 3, 128, 0);
            this.createBox(new THREE.Vector3(-64.0, 1.5, 512.0), this.ZERO_QUATERNION, 1, 3, 128, 0);

            this.createBox(new THREE.Vector3(0.0, 1.5, -64.0), this.ZERO_QUATERNION, 128, 3, 1, 0);
            this.createBox(new THREE.Vector3(0.0, 1.5, 576.0), this.ZERO_QUATERNION, 128, 3, 1, 0);

            const quaternion = new THREE.Quaternion(0, 0, 0, 1);
            quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18);
            this.createBox(new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0);

            //Динамические обхекты
            const size = .75;
            const nw = 8;
            const nh = 6;
            for (let j = 0; j < nw; j++) {
                for (let i = 0; i < nh; i++) {
                    this.createBox(new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10), this.ZERO_QUATERNION, size, size, size, 100);
                }
            }

            //Машины
            const rx7 = new Rx7(this.scene, this.camera, this.physicsWorld, new THREE.Vector3(2, 1, -20));

            rx7.init(this.models['rx_7']);

            this.cars.push(rx7);

            const savana = new Savana(this.scene, this.camera, this.physicsWorld, new THREE.Vector3(3, 1, -20));

            savana.init(this.models['savana']);

            this.cars.push(savana);

            const s13 = new SilviaS13(this.scene, this.camera, this.physicsWorld, new THREE.Vector3(1, 1, -20));

            s13.init(this.models['silvia_s13']);

            this.cars.push(s13);

            this.playerController = new PlayerController(
                this.models['evo_6'],
                this.scene,
                this.renderer,
                this.camera,
                this.physicsWorld,
            );

            document.body.appendChild(this.renderer.getElement());

            this.debugController.init(this.physicsWorld, this.scene, this.sun);

            this.clock = new THREE.Clock();

            this.bind();
        });
    }

    public loop(): void {
        const delta = this.clock.getDelta();

        this.debugController.update(delta);

        for (let i = 0; i < this.syncList.length; i++) {
            this.syncList[i](delta);
        }

        this.playerController.update(delta);

        this.cars.forEach((c: Car) => {
            c.update(delta, {});
        })

        this.sun.update(this.camera);

        this.sky.update(this.sun);

        this.physicsWorld.stepSimulation(delta, 10);
        this.time += delta;

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => {
            this.loop();
        });
    }
}
