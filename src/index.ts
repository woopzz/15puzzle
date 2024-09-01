import './style.css';

import { Board, solved, SOLVED_BOARD_STATE } from './game/board';
import { Shuffle } from './game/shuffle';
import { Solve } from './game/solve';

import wasm_init, { start } from 'wasm-15puzzle';

const TILE_LABEL_TO_REPR = new Map<string, string>([
    ['1', '0'], ['2', '1'], ['3', '2'], ['4', '3'],
    ['5', '4'], ['6', '5'], ['7', '6'], ['8', '7'],
    ['9', '8'], ['10', '9'], ['11', 'A'], ['12', 'B'],
    ['13', 'C'], ['14', 'D'], ['15', 'E'], ['0', 'F'],
]);
const TILE_REPR_TO_LABEL = new Map<string, string>([
    ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'],
    ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'],
    ['8', '9'], ['9', '10'], ['A', '11'], ['B', '12'],
    ['C', '13'], ['D', '14'], ['E', '15'], ['F', '0'],
]);

function repaintUI(board: Board, path: Array<number>): void {
    const fieldNode = document.querySelector('.field') as HTMLElement;
    const wonMsgNode = document.querySelector('.won-msg') as HTMLElement;

    const boxNodes = fieldNode.children;
    for (let i = 0; i < board.state.length; i++) {
        const node = boxNodes[i] as HTMLElement;
        node.dataset.number = TILE_REPR_TO_LABEL.get(board.state[i]);
        node.style.backgroundColor = '';
    }

    if (path.length) {
        const boxNode = boxNodes[path.at(-1)] as HTMLElement;
        boxNode.style.backgroundColor = '#bbb';
    }

    wonMsgNode.style.display = solved(board) ? 'block' : 'none';
}

const getShuffledBoard = (): Board => new Shuffle(new Board(SOLVED_BOARD_STATE, [])).execute();

function init(): void {
    // let board = getShuffledBoard();
    // let path: Array<number> = [];
    // const _repaintUI = () => repaintUI(board, path);

    // document.querySelector('.field').addEventListener('click', function (event) {
    //     const node = event.target as HTMLElement;
    //     if (!node.classList.contains('box')) return;

    //     const tile = TILE_LABEL_TO_REPR.get(node.dataset.number);
    //     if (tile === undefined) return;

    //     const tileIndex = board.state.indexOf(tile);

    //     if (board.canBeMoved(tileIndex)) board = board.move(tileIndex);

    //     if (path.length) {
    //         if (board.path.length && board.path.at(-1) === path.at(-1)) path.pop();
    //         else path = [];
    //     }

    //     _repaintUI();
    // });

    // document.querySelector('.hint').addEventListener('click', function () {
    //     path = Array.from(autosolve(board.state)).reverse();
    //     _repaintUI();
    // });

    // document.querySelector('.shuffle').addEventListener('click', function () {
    //     board = getShuffledBoard();
    //     path = [];
    //     _repaintUI();
    // });

    start();
    // _repaintUI();
}

wasm_init().then(() => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
});
