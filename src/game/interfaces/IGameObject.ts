export interface IGameObject {
    uuid(): string;

    update(updates: number[]): void;
}
