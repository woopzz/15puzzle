/**
    0 1 2 3
    4 5 6 7
    8 9 A B
    C D E F
**/
import { Board, solvable, SOLVED_BOARD_STATE } from './board';
import { Shuffle } from './shuffle';
import { Solve } from './solve';

function buildBoard(state: Board['state']): Board {
    return new Board(state);
}

function shuffle(board: Board): Board {
    const shuffle = new Shuffle(board);
    return shuffle.execute();
}

function solve(board: Board): Board {
    return new Solve(board).execute();
}

describe('Board', function () {
    it('should return a correct board when move is possible', function () {
        expect(buildBoard('0123456789ABCDEF').goUp().state).toEqual('0123456789AFCDEB');
        expect(buildBoard('0123456789ABCDEF').goLeft().state).toEqual('0123456789ABCDFE');
        expect(buildBoard('0123456789FBCDAE').goDown().state).toEqual('0123456789ABCDFE');
        expect(buildBoard('0123456789ABCFED').goRight().state).toEqual('0123456789ABCEFD');
    });
    it('should return null when you go overboard', function () {
        expect(new Board('012F456389A7CDEB').goUp()).toBeNull();
        expect(new Board('F012456389A7CDEB').goLeft()).toBeNull();
        expect(new Board('0123456789ABCDEF').goDown()).toBeNull();
        expect(new Board('0123456789ABCDEF').goRight()).toBeNull();
    });
});

describe('Shuffle', function () {
    it('should return a random board', function () {
        expect(shuffle(buildBoard(SOLVED_BOARD_STATE)).state).not.toEqual(SOLVED_BOARD_STATE);
    });
    it('should return a solvable board', function () {
        expect(solvable(shuffle(buildBoard(SOLVED_BOARD_STATE)))).toStrictEqual(true);
    });
    it('should identify unsolvable boards', function () {
        expect(solvable(buildBoard('2C4E857F960DB1A3'))).toStrictEqual(false);
        expect(solvable(buildBoard('0C187FE629AD453B'))).toStrictEqual(false);
        expect(solvable(buildBoard('508923D6BE1AFC74'))).toStrictEqual(true);
    });
});

describe('Solve', function () {
    it('should find a way to get the solved board', function () {
        expect(solve(buildBoard('508923D6BE1AFC74')).state).toEqual(SOLVED_BOARD_STATE);
    });
});
