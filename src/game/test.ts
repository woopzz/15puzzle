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
    it('should check that a tile can be moved', function () {
        expect(buildBoard('0123456789ABCDEF').canBeMoved(-200)).toStrictEqual(false);
        expect(buildBoard('0123456789ABCDEF').canBeMoved(0)).toStrictEqual(false);
        expect(buildBoard('0123456789ABCDEF').canBeMoved(10)).toStrictEqual(false);
        expect(buildBoard('0123456789ABCDEF').canBeMoved(100)).toStrictEqual(false);

        // 0 1 2 3
        // 4 5 6 7
        // 8 9 F A
        // C D E B
        expect(buildBoard('0123456789FACDEB').canBeMoved(6)).toStrictEqual(true);
        expect(buildBoard('0123456789FACDEB').canBeMoved(9)).toStrictEqual(true);
        expect(buildBoard('0123456789FACDEB').canBeMoved(11)).toStrictEqual(true);
        expect(buildBoard('0123456789FACDEB').canBeMoved(14)).toStrictEqual(true);
    });
    it('should replace a tile with the blank one', function () {
        expect(buildBoard('0123456789ABCDEF').move(11).state).toEqual('0123456789AFCDEB');
        expect(buildBoard('0123456789ABCDEF').move(14).state).toEqual('0123456789ABCDFE');
        expect(buildBoard('F123056749AB8CDE').move(4).state).toEqual('0123F56749AB8CDE');
        expect(buildBoard('F123056749AB8CDE').move(1).state).toEqual('1F23056749AB8CDE');
    });
    it('should remember moved tiles (indexes) in a right order', function () {
        const board = buildBoard('0123456789ABCDEF').move(14).move(10).move(9).move(13).move(14);
        expect(board.path.length).toStrictEqual(5);
        expect(board.path[0]).toStrictEqual(14);
        expect(board.path[1]).toStrictEqual(10);
        expect(board.path[2]).toStrictEqual(9);
        expect(board.path[3]).toStrictEqual(13);
        expect(board.path[4]).toStrictEqual(14);
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
        const initialBoard = buildBoard('508923D6BE1AFC74');
        const solvedBoard = solve(initialBoard);

        expect(solvedBoard.state).toEqual(SOLVED_BOARD_STATE);

        let tempBoard: Board = initialBoard;
        for (const tileIndex of solvedBoard.path) {
            tempBoard = tempBoard.move(tileIndex);
        }

        expect(tempBoard.state).toEqual(SOLVED_BOARD_STATE);
    });
    it('should return an empty path if the board is solved in the first place', function () {
        expect(solve(buildBoard(SOLVED_BOARD_STATE)).path.length).toStrictEqual(0);
    });
});
