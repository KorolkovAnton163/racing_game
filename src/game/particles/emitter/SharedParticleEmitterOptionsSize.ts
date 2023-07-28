import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";
import {Utils} from "../Utils";

export interface SharedParticleEmitterOptionsSizeInterface {
    value: number | number[];
    spread: number | number[];
    randomise: boolean;
}

export class SharedParticleEmitterSize extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'size';

    private _value: number[];

    private _spread: number[];

    private _randomise: boolean;

    public get value(): number[] {
        return this._value;
    }

    public set value(value: number[]) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._value = value;
    }

    public get spread(): number[] {
        return this._spread;
    }

    public set spread(value: number[]) {
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

    constructor(data: SharedParticleEmitterOptionsSizeInterface) {
        super();

        this._value = Array.isArray(data.value) ? data.value : [data.value];

        this._spread = Array.isArray(data.spread) ? data.spread : [data.spread];

        this._randomise = data.randomise;

        const valueLength = Utils.clamp(this._value.length, Utils.VALUE_OVER_LIFETIME_LENGTH, Utils.VALUE_OVER_LIFETIME_LENGTH);
        const spreadLength = Utils.clamp(this._spread.length, Utils.VALUE_OVER_LIFETIME_LENGTH, Utils.VALUE_OVER_LIFETIME_LENGTH);
        const desiredLength = Math.max(valueLength, spreadLength);

        if (this._value.length !== desiredLength) {
            this._value = Utils.interpolateArray(this._value, desiredLength) as number[];
        }

        if (this._spread.length !== desiredLength) {
            this._spread = Utils.interpolateArray(this._spread, desiredLength) as number[];
        }
    }
}
