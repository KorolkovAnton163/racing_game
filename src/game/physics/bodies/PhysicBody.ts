export abstract class PhysicBody {
    public uuid: string = '';

    public static: boolean = false;

    public abstract update(dt: number): Float32Array;
}
