import {DirectionLight} from "../light/DirectionLight";
import {Scene} from "../Scene";
import {Camera} from "../Camera";

export class Sun {
    private main: DirectionLight;

    public get mainLight(): DirectionLight {
        return this.main;
    }

    constructor() {
        this.main = new DirectionLight({
            color: 0xFFAAAA,
            intensity: 0.5,
            mapSize: 4096.0,
            left: 10.0,
            right: 10.0,
            bottom: 10.0,
            top: 10.0,
        });

        this.main.setFromSphericalCoords(45.0, 180);
    }

    public init(scene: Scene): void {
        scene.addObject(this.main.getLight());
        scene.addObject(this.main.getTarget());
        scene.addObject(this.main.getHelper());
    }

    public update(camera: Camera): void {
        this.main.update(camera.x, camera.z);
    }
}
