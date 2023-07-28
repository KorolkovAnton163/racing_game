import * as THREE from "three";
import {Distributions} from "../Utils";
import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";

export interface SharedParticleEmitterOptionsAccelerationInterface {
    value: THREE.Vector3;
    spread: THREE.Vector3;
    distribution: Distributions;
    randomise: boolean;
}

export class SharedParticleEmitterAcceleration extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'acceleration';

    private _value: THREE.Vector3;

    private _spread: THREE.Vector3;

    private _distribution: Distributions;

    private _randomise: boolean;

    public get value(): THREE.Vector3 {
        return this._value;
    }

    public set value(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._value = value;
    }

    public get spread(): THREE.Vector3 {
        return this._spread;
    }

    public set spread(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._spread = value;
    }

    public get distribution(): Distributions {
        return this._distribution;
    }

    public set distribution(value: Distributions) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._distribution = value;
    }

    public get randomise(): boolean {
        return this._randomise;
    }

    public set randomise(value: boolean) {
        this.resetUpdate(value);

        this.group.updateDefines();

        this._randomise = value;
    }

    constructor(data: SharedParticleEmitterOptionsAccelerationInterface) {
        super();

        this._value = data.value;

        this._spread = data.spread;

        this._distribution = data.distribution;

        this._randomise = data.randomise;
    }
}
