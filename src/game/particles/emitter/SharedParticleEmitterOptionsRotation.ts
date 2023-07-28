import * as THREE from "three";
import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";

export interface SharedParticleEmitterOptionsRotationInterface {
    axis: THREE.Vector3;
    axisSpread: THREE.Vector3;
    angle: number;
    angleSpread: number;
    static: boolean;
    center: THREE.Vector3;
    randomise: boolean;
}

export class SharedParticleEmitterRotation extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'rotation';

    private _axis: THREE.Vector3;

    private _axisSpread: THREE.Vector3;

    private _angle: number;

    private _angleSpread: number;

    private _static: boolean;

    private _center: THREE.Vector3;

    private _randomise: boolean;

    public get axis(): THREE.Vector3 {
        return this._axis;
    }

    public set axis(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._axis = value;
    }

    public get axisSpread(): THREE.Vector3 {
        return this._axisSpread;
    }

    public set axisSpread(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._axisSpread = value;
    }

    public get angle(): number {
        return this._angle;
    }

    public set angle(value: number) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._angle = value;
    }

    public get angleSpread(): number {
        return this._angleSpread;
    }

    public set angleSpread(value: number) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._angleSpread = value;
    }

    public get static(): boolean {
        return this._static;
    }

    public set static(value: boolean) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._static = value;
    }

    public get center(): THREE.Vector3 {
        return this._center;
    }

    public set center(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._center = value;
    }

    public get randomise(): boolean {
        return this._randomise;
    }

    public set randomise(value: boolean) {
        this.resetUpdate(value);

        this.group.updateDefines();

        this._randomise = value;
    }

    constructor(data: SharedParticleEmitterOptionsRotationInterface) {
        super();

        this._axis = data.axis;

        this._axisSpread = data.axisSpread;

        this._angle = data.angle;

        this._angleSpread = data.angleSpread;

        this._static = data.static;

        this._center = data.center;

        this._randomise = data.randomise;
    }
}
