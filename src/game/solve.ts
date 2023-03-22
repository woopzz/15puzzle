import { PriorityQueue } from '@datastructures-js/priority-queue';
import { Board } from './board';
import { LockedTiles } from './lockedTiles';

export class Solve {
    private initialBoard: Board;

    constructor(initialBoard: Board) {
        this.initialBoard = initialBoard;
    }

    execute(): Board {
        const lockedTiles = LockedTiles.getInstance();
        let board = this.initialBoard;

        board = this.bfs(board, new PositionOneTile('0', 0));
        lockedTiles.lock(0);

        board = this.bfs(board, new PositionOneTile('1', 1));
        lockedTiles.lock(1);

        board = this.bfs(board, new PositionOneTile('4', 4));
        lockedTiles.lock(4);

        board = this.bfs(board, new PositionOneTile('5', 5));
        lockedTiles.lock(5);

        board = this.bfs(board, new PositionManyTiles([['2', 3], ['3', 10], ['F', 6]]));
        board = this.applyFormula(board);
        lockedTiles.lock(2);
        lockedTiles.lock(3);

        board = this.bfs(board, new PositionManyTiles([['6', 7], ['7', 14], ['F', 10]]));
        board = this.applyFormula(board);
        lockedTiles.lock(6);
        lockedTiles.lock(7);

        board = this.bfs(board, new PositionManyTiles([['8', 8], ['9', 9], ['A', 10], ['B', 11], ['C', 12], ['D', 13], ['E', 14], ['F', 15]]));

        return board;
    }

    private bfs(initialBoard: Board, solveStrategy: SolveStrategy): Board {
        const heap = new PriorityQueue<Board>(solveStrategy.buildCompareBoards());
        heap.push(initialBoard);

        const visitedStates = new Set();

        let board: Board;
        while (true) {
            board = heap.pop();

            if (visitedStates.has(board.state))
                continue;

            if (solveStrategy.solved(board))
                break;

            for (const go of [board.goUp.bind(board), board.goLeft.bind(board), board.goDown.bind(board), board.goRight.bind(board)]) {
                const nextBoard = go();
                if (nextBoard !== null && !visitedStates.has(nextBoard.state))
                    heap.push(nextBoard);
            }

            visitedStates.add(board.state);
        }

        return board;
    }

    private applyFormula(board: Board): Board {
        /**
         * Sometimes to move a tile on its place you have to rotate a box 2x2.
         * It means you have to move the previously set tile. For example:
         *
         * 0 1 2 6
         * 7 A F 5
         * C 8 3 4
         * B 9 E D
         *
         * You have no way to put the tile '3' on its position wihout moving the tile '2'.
         * So here we manually perform a formula to put the last tile in a row on its place.
         *
         * In order to do so, we require a special configuration:
         *
         * x x x 2
         * x x F x
         * x x 3 x
         * x x x x
         *
         * After this we'll get ...
         *
         * x x 2 3
         * x x F x
         * x x x x
         * x x x x
         *
         * It's true for the second row as well (tiles '6' and '7').
         */
        return board.goDown().goRight().goUp().goUp().goLeft().goDown().goRight().goUp().goLeft().goDown();
    }
}

interface SolveStrategy {
    solved: (board: Board) => boolean,
    buildCompareBoards: () => (a: Board, b: Board) => number,
}

class PositionOneTile implements SolveStrategy {
    private tile: string;
    private destIndex: number;

    constructor(tile: string, destIndex: number) {
        this.tile = tile;
        this.destIndex = destIndex;
    }

    solved(board: Board): boolean {
        return board.state[this.destIndex] === this.tile;
    }

    buildCompareBoards(): (a: Board, b: Board) => number {
        return (a: Board, b: Board) => this.calcManhattanDistance(a) < this.calcManhattanDistance(b) ? -1 : 1;
    }

    private calcManhattanDistance(board: Board) {
        const blankTileIndex = board.state.indexOf('F');
        const index = board.state.indexOf(this.tile);

        const curCol = calcCol(index);
        const curRow = calcRow(index);

        let destCol: number;
        let destRow: number;
        if (near(index, blankTileIndex) || this.tile == 'F') {
            destCol = calcCol(this.destIndex);
            destRow = calcRow(this.destIndex);
        } else {
            destCol = calcCol(blankTileIndex);
            destRow = calcRow(blankTileIndex);
        }

        return Math.abs(curCol - destCol) + Math.abs(curRow - destRow);
    }
}

type ListOfTileAndDestIndex = Array<[string, number]>;

class PositionManyTiles implements SolveStrategy {
    private listOfTileAndDestIndex: ListOfTileAndDestIndex;

    constructor(listOfTileAndDestIndex: ListOfTileAndDestIndex) {
        this.listOfTileAndDestIndex = listOfTileAndDestIndex;
    }

    solved(board: Board): boolean {
        return this.listOfTileAndDestIndex.every(tileAndDestIndex => board.state[tileAndDestIndex[1]] === tileAndDestIndex[0]);
    }

    buildCompareBoards(): (a: Board, b: Board) => number {
        return (a: Board, b: Board) => this.calcManhattanDistance(a) < this.calcManhattanDistance(b) ? -1 : 1;
    }

    private calcManhattanDistance(board: Board): number {
        let distance = 0

        for (const tileAndDestIndex of this.listOfTileAndDestIndex) {
            const index = board.state.indexOf(tileAndDestIndex[0]);

            const curCol = calcCol(index);
            const curRow = calcRow(index);

            const destCol = calcCol(tileAndDestIndex[1]);
            const destRow = calcRow(tileAndDestIndex[1]);

            distance += Math.abs(curCol - destCol) + Math.abs(curRow - destRow);
        }

        return distance
    }
}

function near(index1: number, index2: number): boolean {
    const col1 = calcCol(index1);
    const row1 = calcRow(index1);

    const col2 = calcCol(index2);
    const row2 = calcRow(index2);

    return (
        Math.abs(col1 - col2) == 1 && row1 === row2 ||
        Math.abs(row1 - row2) == 1 && col1 === col2
    );
}

function calcCol(index: number): number {
    return Math.floor(index / 4);
}

function calcRow(index: number): number {
    return index % 4;
}
