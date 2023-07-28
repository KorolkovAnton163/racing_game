import * as THREE from "three";
import {Distributions} from "../Utils";
import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";

export interface SharedParticleEmitterOptionsPositionInterface {
    radius: number;
    value: THREE.Vector3;
    spread: THREE.Vector3;
    spreadClamp: THREE.Vector3;
    radiusScale: THREE.Vector3;
    distribution: Distributions;
    randomise: boolean;
    distributionClamp?: number;
}

export class SharedParticleEmitterPosition extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'position';

    private _radius: number;

    private _value: THREE.Vector3;

    private _spread: THREE.Vector3;

    private _spreadClamp: THREE.Vector3;

    private _radiusScale: THREE.Vector3;

    private _distribution: Distributions;

    private _randomise: boolean;

    private _distributionClamp?: number;

    public get radius(): number {
        return this._radius;
    }

    public set radius(value: number) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._radius = value;
    }

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

    public get spreadClamp(): THREE.Vector3 {
        return this._spreadClamp;
    }

    public set spreadClamp(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._spreadClamp = value;
    }

    public get radiusScale(): THREE.Vector3 {
        return this._radiusScale;
    }

    public set radiusScale(value: THREE.Vector3) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._radiusScale = value;
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

    public get distributionClamp(): number | undefined {
        return this._distributionClamp;
    }

    public set distributionClamp(value: number | undefined ) {
        this.updateFlags.set('position', true);
        this.updateCounts.set('position', 0.0);

        this._distributionClamp = value;
    }

    constructor(data: SharedParticleEmitterOptionsPositionInterface) {
        super();

        this._radius = data.radius;

        this._value = data.value;

        this._spread = data.spread;

        this._radiusScale = data.radiusScale;

        this._distribution = data.distribution;

        this._randomise = data.randomise;

        this._distributionClamp = data.distributionClamp;
    }
}
