import * as THREE from 'three';
import {Scene} from "../Scene";
import Stats from "three/examples/jsm/libs/stats.module";
import {DirectionLight} from "../light/DirectionLight";
import {DebugLines} from "./DebugLines";
import {AmmoDebugDrawer, DefaultBufferSize} from "./AmmoDebugDrawer";

export class DebugController {
    private world: Ammo.btDiscreteDynamicsWorld;

    private scene: Scene;

    private sun: DirectionLight;

    private lines: DebugLines;

    protected shadowCamera: THREE.CameraHelper;

    private stats: Stats;

    private enabled: boolean = true;

    // private debugGeometry: THREE.BufferGeometry;

    // private debugDrawer: AmmoDebugDrawer;

    public init(scene: Scene, sun: DirectionLight): void {
        if (!this.enabled) {
            return;
        }

        // this.world = world;
        this.scene = scene;
        this.sun = sun;

        this.stats = new Stats();
        this.lines = new DebugLines();
        this.shadowCamera = new THREE.CameraHelper(this.sun.getLight().shadow.camera);

        this.scene.addObject(this.lines.getMesh());
        this.scene.addObject(this.shadowCamera);

        this.stats.dom.style.left = 'auto';
        this.stats.dom.style.right = '0px';

        document.body.appendChild(this.stats.dom);

        // const debugVertices = new Float32Array(DefaultBufferSize);
        // const debugColors = new Float32Array(DefaultBufferSize);
        //
        // this.debugGeometry = new THREE.BufferGeometry();
        // this.debugGeometry.setAttribute("position", new THREE.BufferAttribute(debugVertices, 3));
        // this.debugGeometry.setAttribute("color", new THREE.BufferAttribute(debugColors, 3));
        //
        // const debugMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
        // const debugMesh = new THREE.LineSegments(this.debugGeometry, debugMaterial);
        //
        // debugMesh.frustumCulled = false;
        // scene.addObject(debugMesh);
        //
        // this.debugDrawer = new AmmoDebugDrawer(null, debugVertices, debugColors, this.world);
        // this.debugDrawer.enable();
    }

    public getDebugMode(): number {
        return 0;
    }

    public update(delta: number): void {
        if (!this.enabled) {
            return;
        }

        // if (this.debugDrawer.index !== 0) {
        //     this.debugGeometry.attributes.position.needsUpdate = true;
        //     this.debugGeometry.attributes.color.needsUpdate = true;
        // }
        //
        // this.debugGeometry.setDrawRange(0, Number(this.debugDrawer.index));
        // this.debugDrawer.update();

        this.stats.update();
    }
}
