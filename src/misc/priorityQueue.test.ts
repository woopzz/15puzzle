import { PriorityQueue } from './priorityQueue';

const buildQueue = () => new PriorityQueue<number>();

describe('Priority Queue', function () {
    it('should allow to add an item with its priority', function () {
        const queue = buildQueue();
        const item = 10;
        const priority = 1;
        queue.insert(item, priority);
    });
    it('should always return a minimal item', function () {
        const queue = buildQueue();
        queue.insert(10, 5);
        queue.insert(20, 0);
        queue.insert(30, 10);
        expect(queue.extractMin()).toStrictEqual(20);
        expect(queue.extractMin()).toStrictEqual(10);
        expect(queue.extractMin()).toStrictEqual(30);
    });
    it('should return items in order they were added if there are several items with same priority', function () {
        const queue = buildQueue();
        queue.insert(1, 0);
        queue.insert(2, 0);
        expect(queue.extractMin()).toStrictEqual(1);
        expect(queue.extractMin()).toStrictEqual(2);
    });
    it('should raise an exception if we try to get an item from the empty queue', function () {
        const queue = buildQueue();
        expect(() => queue.extractMin()).toThrow(/empty/);
    });
});
