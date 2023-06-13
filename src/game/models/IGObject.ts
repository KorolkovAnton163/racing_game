export interface IGObject {
    uuid(): string;

    update(updates: number[]): void;
}
