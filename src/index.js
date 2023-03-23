import './style.css';
import { Solve } from './game/solve';
import { BLANK_TILE, Board, Direction } from './game/board';


class Model {

    _EMPTY_BOX = 0
    _BOXES_IN_RIGHT_ORDER = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, this._EMPTY_BOX,
    ]

    constructor() {
        this._boxes = Array.from(this._BOXES_IN_RIGHT_ORDER);
        this._finished = true;
        this._subscribers = new Set();
        this._path = null;
    }

    get board() {
        return this._boxes.map(box => box === this._EMPTY_BOX ? BLANK_TILE : (box - 1).toString(16)).join('').toUpperCase();
    }

    init() {
        this.shuffleBoxes();
    }

    addSubscriber(subscriber) {
        this._subscribers.add(subscriber);
    }

    setPath(path) {
        this._path = path;
        this._notifyBoxOrderChanged();
    }

    shuffleBoxes() {
        new Shuffle(this._boxes, this._EMPTY_BOX).execute();
        this._notifyBoxOrderChanged();
        this._updateGameStatus();
    }

    moveBox(box) {
        const boxIndex = this._boxes.indexOf(box);
        const emptyBoxIndex = this._boxes.indexOf(this._EMPTY_BOX);

        if (this._path && this._path.length) {
            let destIndex;
            switch (this._path.at(-1)) {
                case Direction.UP: destIndex = emptyBoxIndex - 4; break;
                case Direction.LEFT: destIndex = emptyBoxIndex - 1; break;
                case Direction.DOWN: destIndex = emptyBoxIndex + 4; break;
                case Direction.RIGHT: destIndex = emptyBoxIndex + 1; break;
            }
            if (destIndex === boxIndex) {
                this._path.pop();
            } else {
                this._path = null;
            }
        }

        if (
            boxIndex - 4 === emptyBoxIndex ||
            boxIndex + 4 === emptyBoxIndex ||
            boxIndex - 1 === emptyBoxIndex ||
            boxIndex + 1 === emptyBoxIndex
        ) {
            this._boxes[boxIndex] = this._EMPTY_BOX;
            this._boxes[emptyBoxIndex] = box;
            this._notifyBoxOrderChanged();
            this._updateGameStatus();
        }
    }

    _updateGameStatus() {
        const finished = this._isFinished();
        if (this._finished !== finished) {
            this._finished = finished;
            this._notifyGameStatusChanged();
        }
    }

    _isFinished() {
        for (let i = 0; i < this._boxes.length; i++) {
            if (this._boxes[i] !== this._BOXES_IN_RIGHT_ORDER[i]) {
                return false;
            }
        }
        return true;
    }

    _notifyBoxOrderChanged() {
        for (let subscriber of this._subscribers) {
            subscriber.onBoxOrderChanged(Array.from(this._boxes), this._path);
        }
    }

    _notifyGameStatusChanged() {
        for (let subscriber of this._subscribers) {
            subscriber.onGameStatusChanged(this._finished);
        }
    }

}


class View {

    constructor(node) {
        this._rootNode = node;
        this._fieldNode = node.querySelector('.field');
        this._wonMsgNode = node.querySelector('.won-msg');
        this._hintNode = node.querySelector('.hint');
    }

    onGameStatusChanged(finished) {
        this._wonMsgNode.style.display = finished ? 'block' : 'none';
    }

    onBoxOrderChanged(boxes, path) {
        const boxNodes = this._fieldNode.children;

        for (let i = 0; i < boxes.length; i++) {
            boxNodes[i].dataset.number = boxes[i];
            boxNodes[i].style.backgroundColor = '';
        }

        const blankBoxIndex = boxes.indexOf(0);

        if (path && path.length) {
            let destIndex;
            switch (path.at(-1)) {
                case Direction.UP: destIndex = blankBoxIndex - 4; break;
                case Direction.LEFT: destIndex = blankBoxIndex - 1; break;
                case Direction.DOWN: destIndex = blankBoxIndex + 4; break;
                case Direction.RIGHT: destIndex = blankBoxIndex + 1; break;
            }
            boxNodes[destIndex].style.backgroundColor = '#bbb';
        }
    }

    setupCommandMoveBox(handler) {
        this._fieldNode.addEventListener('click', function (event) {
            const node = event.target;
            if (node.classList.contains('box')) {
                const box = +node.dataset.number;
                handler(box);
            }
        });
    }

    setupCommandHint(handler) {
        this._hintNode.addEventListener('click', () => handler());
    }

}


class Controller {

    constructor(model, view) {
        view.setupCommandMoveBox(box => model.moveBox(box));
        view.setupCommandHint(function () {
            const solvedBoard = new Solve(new Board(model.board)).execute();
            model.setPath(solvedBoard.path.reverse());
        });
    }

}


class Shuffle {

    constructor(boxes, emptyBox) {
        this._boxes = boxes;
        this._emptyBox = emptyBox;
    }

    execute() {
        while (true) {
            this._shuffle();
            if (this._isSolvable()) break;
        }
    }

    _shuffle() {
        for (let index = this._boxes.length - 1; index > 0; index--) {
            const anotherIndex = Math.floor(Math.random() * index);
            const tmp = this._boxes[index];
            this._boxes[index] = this._boxes[anotherIndex];
            this._boxes[anotherIndex] = tmp;
        }
    }

    _isSolvable() {
        const emptyBoxOnRowWithOddIndex = this._findEmptyBoxRowReversedIndex() & 1;
        const inversionsCountIsOddNumber = this._calcInversionsCount() & 1;
        return emptyBoxOnRowWithOddIndex ^ inversionsCountIsOddNumber;
    }

    _findEmptyBoxRowReversedIndex() {
        const index = this._boxes.indexOf(this._emptyBox);
        return 4 - Math.floor(index / 4);
    }

    _calcInversionsCount() {
        let count = 0;
        for (let i = 0; i < this._boxes.length - 1; i++) {
            for (let j = i + 1; j < this._boxes.length; j++) {
                if (
                    this._boxes[i] !== this._emptyBox &&
                    this._boxes[j] !== this._emptyBox &&
                    this._boxes[i] > this._boxes[j]
                ) {
                    count++;
                }
            }
        }
        return count;
    }

}

function init() {
    const model = new Model();
    const view = new View(document.body);
    new Controller(model, view);

    model.addSubscriber(view);
    model.init();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
