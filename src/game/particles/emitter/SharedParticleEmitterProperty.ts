import {ShaderParticleGroup} from "../ShaderParticleGroup";

export abstract class SharedParticleEmitterProperty {
    protected abstract readonly FLAG: string;

    public updateFlags: Map<string, boolean>;

    public updateCounts: Map<string, number>;

    public resetFlags: Record<string, boolean>;

    public group: ShaderParticleGroup;

    public setUpdates(
        updateFlags: Map<string, boolean>,
        updateCounts: Map<string, number>,
        resetFlags: Record<string, boolean>,
        group: ShaderParticleGroup
    ): void {
        this.updateFlags = updateFlags;

        this.updateCounts = updateCounts;

        this.resetFlags = resetFlags;

        this.group = group;
    }

    protected flagsUpdate(): void {
        this.updateFlags.set(this.FLAG, true);
        this.updateCounts.set(this.FLAG, 0.0);
    }

    protected resetUpdate(value: boolean): void {
        this.resetFlags[this.FLAG] = value;
    }
}
