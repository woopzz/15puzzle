import { PriorityQueue } from '@datastructures-js/priority-queue';
import { BLANK_TILE, Board, SOLVED_BOARD_STATE } from './board';
import { LockedTiles } from './lockedTiles';

const calcIndexOfTileAbove = (board: Board): number => board.blankTileIndex - 4;
const calcIndexOfTileOnTheLeft = (board: Board): number => board.blankTileIndex - 1;
const calcIndexOfTileBelow = (board: Board): number => board.blankTileIndex + 4;
const calcIndexOfTileOnTheRight = (board: Board): number => board.blankTileIndex + 1;

function checkTilesOnTheirPlaces(board: Board, tiles: Array<string>): boolean {
    return tiles.filter(tile => board.state.indexOf(tile) !== SOLVED_BOARD_STATE.indexOf(tile)).length === 0;
}

export class Solve {
    private initialBoard: Board;
    private lockedTiles: LockedTiles;

    constructor(initialBoard: Board) {
        this.initialBoard = new Board(initialBoard.state);
        this.lockedTiles = new LockedTiles();
    }

    execute(): Board {
        let board = this.initialBoard;

        if (!checkTilesOnTheirPlaces(board, ['0'])) board = this.bfs(board, new PositionOneTile('0', 0));
        this.lockedTiles.lock(0);

        if (!checkTilesOnTheirPlaces(board, ['1'])) board = this.bfs(board, new PositionOneTile('1', 1));
        this.lockedTiles.lock(1);

        if (!checkTilesOnTheirPlaces(board, ['4'])) board = this.bfs(board, new PositionOneTile('4', 4));
        this.lockedTiles.lock(4);

        if (!checkTilesOnTheirPlaces(board, ['5'])) board = this.bfs(board, new PositionOneTile('5', 5));
        this.lockedTiles.lock(5);

        if (!checkTilesOnTheirPlaces(board, ['2', '3'])) {
            board = this.bfs(board, new PositionManyTiles([['2', 3], ['3', 10], [BLANK_TILE, 6]]));
            board = this.applyFormula(board);
        }
        this.lockedTiles.lock(2);
        this.lockedTiles.lock(3);

        if (!checkTilesOnTheirPlaces(board, ['6', '7'])) {
            board = this.bfs(board, new PositionManyTiles([['6', 7], ['7', 14], [BLANK_TILE, 10]]));
            board = this.applyFormula(board);
        }
        this.lockedTiles.lock(6);
        this.lockedTiles.lock(7);

        if (!checkTilesOnTheirPlaces(board, ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F'])) {
            board = this.bfs(board, new PositionManyTiles([['8', 8], ['9', 9], ['A', 10], ['B', 11], ['C', 12], ['D', 13], ['E', 14], ['F', 15]]));
        }

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

            for (const tileIndex of [
                calcIndexOfTileAbove(board), calcIndexOfTileOnTheLeft(board),
                calcIndexOfTileBelow(board), calcIndexOfTileOnTheRight(board),
            ]) {
                if (board.canBeMoved(tileIndex) && !this.lockedTiles.locked(tileIndex)) {
                    const nextBoard = board.move(tileIndex);
                    if (!visitedStates.has(nextBoard.state))
                        heap.push(nextBoard);
                }
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
        board = board.move(calcIndexOfTileBelow(board));
        board = board.move(calcIndexOfTileOnTheRight(board));
        board = board.move(calcIndexOfTileAbove(board));
        board = board.move(calcIndexOfTileAbove(board));
        board = board.move(calcIndexOfTileOnTheLeft(board));
        board = board.move(calcIndexOfTileBelow(board));
        board = board.move(calcIndexOfTileOnTheRight(board));
        board = board.move(calcIndexOfTileAbove(board));
        board = board.move(calcIndexOfTileOnTheLeft(board));
        board = board.move(calcIndexOfTileBelow(board));
        return board;
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
        return (a: Board, b: Board) => this.calcManhattanDistance(a) + a.path.length < this.calcManhattanDistance(b) + b.path.length ? -1 : 1;
    }

    private calcManhattanDistance(board: Board) {
        const blankTileIndex = board.state.indexOf(BLANK_TILE);
        const index = board.state.indexOf(this.tile);

        const curCol = calcCol(index);
        const curRow = calcRow(index);

        let destCol: number;
        let destRow: number;
        if (near(index, blankTileIndex) || this.tile == BLANK_TILE) {
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
        return (a: Board, b: Board) => this.calcManhattanDistance(a) + a.path.length < this.calcManhattanDistance(b) + b.path.length ? -1 : 1;
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
