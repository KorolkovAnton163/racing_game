import * as THREE from "three";
import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";
import {Utils} from "../Utils";

export interface SharedParticleEmitterOptionsColorInterface {
    value: THREE.Color;
    spread: THREE.Vector3;
    randomise: boolean;
}

export class SharedParticleEmitterColor extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'color';

    private _value: THREE.Color[];

    private _spread: THREE.Vector3[];

    private _randomise: boolean;

    public get value(): THREE.Color[] {
        return this._value;
    }

    public set value(value: THREE.Color[]) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._value = value;
    }

    public get spread(): THREE.Vector3[] {
        return this._spread;
    }

    public set spread(value: THREE.Vector3[]) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._spread = value;
    }

    public get randomise(): boolean {
        return this._randomise;
    }

    public set randomise(value: boolean) {
        this.resetUpdate(value);

        this.group.updateDefines();

        this._randomise = value;
    }

    constructor(data: SharedParticleEmitterOptionsColorInterface) {
        super();

        this._value = [data.value];

        this._spread = [data.spread];

        this._randomise = data.randomise;

        const valueLength = Utils.clamp(this._value.length, Utils.VALUE_OVER_LIFETIME_LENGTH, Utils.VALUE_OVER_LIFETIME_LENGTH);
        const spreadLength = Utils.clamp(this._spread.length, Utils.VALUE_OVER_LIFETIME_LENGTH, Utils.VALUE_OVER_LIFETIME_LENGTH);
        const desiredLength = Math.max(valueLength, spreadLength);

        if (this._value.length !== desiredLength) {
            this._value = Utils.interpolateArray(this._value, desiredLength) as THREE.Color[];
        }

        if (this._spread.length !== desiredLength) {
            this._spread = Utils.interpolateArray(this._spread, desiredLength) as THREE.Vector3[];
        }
    }
}
