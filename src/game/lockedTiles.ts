export class LockedTiles {
    private static instance: LockedTiles;
    private state: Array<boolean>;

    private constructor() {
        this.reset();
    }

    static getInstance(): LockedTiles {
        if (!this.instance)
            this.instance = new LockedTiles();

        return this.instance;
    }

    locked(index: number): boolean {
        return this.state[index];
    }

    lock(index: number): void {
        this.state[index] = true;
    }

    unlock(index: number): void {
        this.state[index] = false;
    }

    reset(): void {
        this.state = new Array<boolean>(16).fill(false);
    }
}
