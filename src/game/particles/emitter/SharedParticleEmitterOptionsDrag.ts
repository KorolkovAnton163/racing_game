import {SharedParticleEmitterProperty} from "./SharedParticleEmitterProperty";

export interface SharedParticleEmitterOptionsDragInterface {
    value: number;
    spread: number;
    randomise: boolean;
}

export class SharedParticleEmitterDrag extends SharedParticleEmitterProperty {
    protected readonly FLAG: string = 'acceleration';

    private _value: number;

    private _spread: number;

    private _randomise: boolean;

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

    public get randomise(): boolean {
        return this._randomise;
    }

    public set randomise(value: boolean) {
        this.resetUpdate(value);

        this.group.updateDefines();

        this._randomise = value;
    }

    constructor(data: SharedParticleEmitterOptionsDragInterface) {
        super();

        this._value = data.value;

        this._spread = data.spread;

        this._randomise = data.randomise;
    }
}
