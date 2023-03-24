export class LockedTiles {
    private state: Array<boolean>;

    constructor() {
        this.state = new Array<boolean>(16).fill(false);
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
}
