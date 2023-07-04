export interface IGameObject {
    uuid(): string;

    update(updates: Float32Array): void;
}
