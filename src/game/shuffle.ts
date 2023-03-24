import { Board, solvable, solved } from './board';

export class Shuffle {
    private board: Board;

    constructor(board: Board) {
        this.board = board;
    }

    execute(): Board {
        while (true) {
            this.shuffle();
            if (solvable(this.board) && !solved(this.board)) break;
        }
        return this.board;
    }

    private shuffle(): void {
        const tiles = Array.from(this.board.state);
        for (let index = tiles.length - 1; index > 0; index--) {
            const anotherIndex = Math.floor(Math.random() * index);
            const tmp = tiles[index];
            tiles[index] = tiles[anotherIndex];
            tiles[anotherIndex] = tmp;
        }
        this.board = new Board(tiles.join(''));
    }
}
