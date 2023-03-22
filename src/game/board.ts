import { LockedTiles } from './lockedTiles';

export const SOLVED_BOARD_STATE = '0123456789ABCDEF';
export const BLANK_TILE = 'F';

export class Board implements Board {
    readonly state: string;
    private blankTileIndex: number;

    constructor(state: string) {
        this.state = state;
        this.blankTileIndex = state.indexOf(BLANK_TILE);
    }

    goUp(): Board | null {
        const nextIndex = this.blankTileIndex - 4;

        if (nextIndex < 0 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex);
    }

    goLeft(): Board | null {
        const nextIndex = this.blankTileIndex - 1;

        if (this.blankTileIndex % 4 === 0 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(this.blankTileIndex - 1);
    }

    goDown(): Board | null {
        const nextIndex = this.blankTileIndex + 4;

        if (nextIndex >= 16 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex);
    }

    goRight(): Board | null {
        const nextIndex = this.blankTileIndex + 1;

        if (this.blankTileIndex % 4 === 3 || LockedTiles.getInstance().locked(nextIndex))
            return null;

        return this.go(nextIndex);
    }

    private go(tileIndex: number): Board {
        const firstIndex = this.blankTileIndex < tileIndex ? this.blankTileIndex : tileIndex;
        const secondIndex = this.blankTileIndex > tileIndex ? this.blankTileIndex : tileIndex;
        return new Board(
            this.state.slice(0, firstIndex) + this.state[secondIndex] +
            this.state.slice(firstIndex + 1, secondIndex) +
            this.state[firstIndex] + this.state.slice(secondIndex + 1)
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
