import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";

export interface SharedParticleEmitterOptionsMaxAgeInterface {
    value: number;
    spread: number;
}

export class SharedParticleEmitterMaxAge extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'params';

    private _value: number;

    private _spread: number;

    public get value(): number {
        return this._value;
    }

    public set value(value: number) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._value = value;
    }

    public get spread(): number {
        return this._spread;
    }

    public set spread(value: number) {
        this.flagsUpdate();

        this.group.updateDefines();

        this._spread = value;
    }

    constructor(data: SharedParticleEmitterOptionsMaxAgeInterface) {
        super();

        this._value = data.value;

        this._spread = data.spread;
    }
}
