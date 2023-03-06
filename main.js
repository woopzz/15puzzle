function init() {
    const model = new Model();
    const view = new View(document.body);
    new Controller(model, view);

    model.addSubscriber(view);
    model.init();
}


class Model {

    _EMPTY_BOX = ''
    _BOXES_IN_RIGHT_ORDER = [
        '1', '2', '3', '4',
        '5', '6', '7', '8',
        '9', '10', '11', '12',
        '13', '14', '15', this._EMPTY_BOX,
    ]

    constructor() {
        this._boxes = Array.from(this._BOXES_IN_RIGHT_ORDER);
        this._finished = true;
        this._subscribers = new Set();
    }

    init() {
        this.shuffleBoxes();
    }

    addSubscriber(subscriber) {
        this._subscribers.add(subscriber);
    }

    shuffleBoxes() {
        for (let index = this._boxes.length - 1; index > 0; index--) {
            const anotherIndex = Math.floor(Math.random() * index);
            const tmp = this._boxes[index];
            this._boxes[index] = this._boxes[anotherIndex];
            this._boxes[anotherIndex] = tmp;
        }
        this._notifyBoxOrderChanged();
        this._updateGameStatus();
    }

    moveBox(box) {
        const boxIndex = this._boxes.indexOf(box);
        const emptyBoxIndex = this._boxes.indexOf(this._EMPTY_BOX);
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
        const finished = this.isFinished();
        if (this._finished !== finished) {
            this._finished = finished;
            this._notifyGameStatusChanged();
        }
    }

    isFinished() {
        for (let i = 0; i < this._boxes.length; i++) {
            if (this._boxes[i] !== this._BOXES_IN_RIGHT_ORDER[i]) {
                return false;
            }
        }
        return true;
    }

    _notifyBoxOrderChanged() {
        for (let subscriber of this._subscribers) {
            subscriber.onBoxOrderChanged(Array.from(this._boxes));
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
    }

    onGameStatusChanged(finished) {
        this._wonMsgNode.style.display = finished ? 'block' : 'none';
    }

    onBoxOrderChanged(boxes) {
        const boxNodes = this._fieldNode.children;

        for (let i = 0; i < boxes.length; i++) {
            boxNodes[i].dataset.number = boxes[i];
        }
    }

    setupCommandMoveBox(handler) {
        this._fieldNode.addEventListener('click', function (event) {
            const node = event.target;
            if (node.classList.contains('box')) {
                const box = node.dataset.number;
                handler(box);
            }
        });
    }

}


class Controller {

    constructor(model, view) {
        view.setupCommandMoveBox(box => model.moveBox(box));
    }

}
