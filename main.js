function init() {
    const model = new Model();
    const fieldView = new FieldView(document.querySelector('.field'));
    const wonMsgView = new WonMessageView(document.querySelector('.won-msg'));
    new Controller(model, fieldView);

    model.addSubscriberForBoxChanges(fieldView);
    model.addSubscriberForWonChanges(wonMsgView);
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
        this._won = true;
        this._subscribersForBoxChanges = new Set();
        this._subscribersForWonChanges = new Set();
    }

    init() {
        this.shuffleBoxes();
    }

    addSubscriberForBoxChanges(subscriber) {
        this._subscribersForBoxChanges.add(subscriber);
    }

    addSubscriberForWonChanges(subscriber) {
        this._subscribersForWonChanges.add(subscriber);
    }

    shuffleBoxes() {
        for (let index = this._boxes.length - 1; index > 0; index--) {
            const anotherIndex = Math.floor(Math.random() * index);
            const tmp = this._boxes[index];
            this._boxes[index] = this._boxes[anotherIndex];
            this._boxes[anotherIndex] = tmp;
        }
        this._notifyBoxOrderChanged();
        this._updateWonFlag();
    }

    moveBox(box) {
        const boxIndex = this._boxes.indexOf(box);
        if (boxIndex === -1) {
            return;
        }

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
            this._updateWonFlag();
        }
    }

    _updateWonFlag() {
        const won = this._didWin();
        if (this._won !== won) {
            this._won = won;
            this._notifyWonChanged();
        }
    }

    _didWin() {
        for (let i = 0; i < this._boxes.length; i++) {
            if (this._boxes[i] !== this._BOXES_IN_RIGHT_ORDER[i]) {
                return false;
            }
        }
        return true;
    }

    _notifyBoxOrderChanged() {
        for (let subscriber of this._subscribersForBoxChanges) {
            subscriber.onBoxOrderChanged(Array.from(this._boxes));
        }
    }

    _notifyWonChanged() {
        for (let subscriber of this._subscribersForWonChanges) {
            subscriber.onWonChanged(this._won);
        }
    }

}


class WonMessageView {

    constructor(node) {
        this._node = node;
    }

    onWonChanged(won) {
        this._node.style.display = won ? 'block' : 'none';
    }

}


class FieldView {

    constructor(node) {
        this._node = node;
    }

    onBoxOrderChanged(boxes) {
        const boxNodes = this._node.children;

        for (let i = 0; i < boxes.length; i++) {
            boxNodes[i].dataset.number = boxes[i];
        }
    }

    setupCommandMoveBox(handler) {
        this._node.addEventListener('click', function (event) {
            const node = event.target;
            if (node.classList.contains('box')) {
                const box = node.dataset.number;
                handler(box);
            }
        });
    }

}


class Controller {

    constructor(model, fieldView) {
        this._model = model;
        this._fieldView = fieldView;
        this._fieldView.setupCommandMoveBox(box => this._model.moveBox(box));
    }

}
