export class PriorityQueue<T> {
    private queue: Map<number, Array<T>>;

    constructor() {
        this.queue = new Map<number, Array<T>>();
    }

    insert(item: T, priority: number): void {
        if (this.queue.has(priority)) this.queue.get(priority).push(item);
        else this.queue.set(priority, [item]);
    }

    extractMin(): T {
        this.throwErrorIfEmpty();

        const minPriority = this.findSmallestPriority();
        const minItems = this.queue.get(minPriority);
        const minItem = minItems[0];

        if (minItems.length === 1) this.queue.delete(minPriority);
        else minItems.shift();

        return minItem;
    }

    private throwErrorIfEmpty(): void {
        if (this.queue.size === 0) throw new Error('The queue is empty.');
    }

    private findSmallestPriority(): number {
        let minPriority = Infinity;
        this.queue.forEach(function (item, priority) {
            if (priority < minPriority) minPriority = priority;
        });
        return minPriority;
    }
}
