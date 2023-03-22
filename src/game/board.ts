import { LockedTiles } from './lockedTiles';

export const SOLVED_BOARD_STATE = '0123456789ABCDEF';
export const BLANK_TILE = 'F';

export enum Direction {
    UP = 'u',
    LEFT = 'l',
    DOWN = 'd',
    RIGHT = 'r',
}

export class Board implements Board {
    readonly state: string;
    readonly path: Array<Direction>;
    private blankTileIndex: number;

    constructor(state: string, path: Array<Direction> = []) {
        this.state = state;
        this.path = path;
        this.blankTileIndex = state.indexOf(BLANK_TILE);
    }

    goUp(): Board | null {
        const nextIndex = this.blankTileIndex - 4;

        if (nextIndex < 0 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex, Direction.UP);
    }

    goLeft(): Board | null {
        const nextIndex = this.blankTileIndex - 1;

        if (this.blankTileIndex % 4 === 0 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(this.blankTileIndex - 1, Direction.LEFT);
    }

    goDown(): Board | null {
        const nextIndex = this.blankTileIndex + 4;

        if (nextIndex >= 16 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex, Direction.DOWN);
    }

    goRight(): Board | null {
        const nextIndex = this.blankTileIndex + 1;

        if (this.blankTileIndex % 4 === 3 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex, Direction.RIGHT);
    }

    private go(tileIndex: number, direction: Direction): Board {
        const firstIndex = this.blankTileIndex < tileIndex ? this.blankTileIndex : tileIndex;
        const secondIndex = this.blankTileIndex > tileIndex ? this.blankTileIndex : tileIndex;
        return new Board(
            this.state.slice(0, firstIndex) + this.state[secondIndex] +
            this.state.slice(firstIndex + 1, secondIndex) +
            this.state[firstIndex] + this.state.slice(secondIndex + 1),
            [...this.path, direction]
        );
    }
}

export function solvable(board: Board): boolean {
    const emptyBoxOnRowWithOddIndex = findEmptyBoxRowReversedIndex(board) & 1;
    const inversionsCountIsOddNumber = calcInversionsCount(board) & 1;
    return !!(emptyBoxOnRowWithOddIndex ^ inversionsCountIsOddNumber);
}

function findEmptyBoxRowReversedIndex(board: Board): number {
    const index = board.state.indexOf(BLANK_TILE);
    return 4 - Math.floor(index / 4);
}

function calcInversionsCount(board: Board): number {
    let count = 0;
    for (let i = 0; i < board.state.length - 1; i++) {
        for (let j = i + 1; j < board.state.length; j++) {
            if (
                board.state[i] !== BLANK_TILE &&
                board.state[j] !== BLANK_TILE &&
                board.state[i] > board.state[j]
            ) {
                count++;
            }
        }
    }
    return count;
}
