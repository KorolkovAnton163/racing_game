export abstract class PhysicBody {
    public abstract update(dt: number, updated: Record<string, number[]>): void;
}
