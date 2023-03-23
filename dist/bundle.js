/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _game_solve__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _game_board__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(11);





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
        return this._boxes.map(box => box === this._EMPTY_BOX ? _game_board__WEBPACK_IMPORTED_MODULE_2__.BLANK_TILE : (box - 1).toString(16)).join('').toUpperCase();
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
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.UP: destIndex = emptyBoxIndex - 4; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.LEFT: destIndex = emptyBoxIndex - 1; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.DOWN: destIndex = emptyBoxIndex + 4; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.RIGHT: destIndex = emptyBoxIndex + 1; break;
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
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.UP: destIndex = blankBoxIndex - 4; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.LEFT: destIndex = blankBoxIndex - 1; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.DOWN: destIndex = blankBoxIndex + 4; break;
                case _game_board__WEBPACK_IMPORTED_MODULE_2__.Direction.RIGHT: destIndex = blankBoxIndex + 1; break;
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
            const solvedBoard = new _game_solve__WEBPACK_IMPORTED_MODULE_1__.Solve(new _game_board__WEBPACK_IMPORTED_MODULE_2__.Board(model.board)).execute();
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


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Solve": () => (/* binding */ Solve)
/* harmony export */ });
/* harmony import */ var _datastructures_js_priority_queue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _datastructures_js_priority_queue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_datastructures_js_priority_queue__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _lockedTiles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);



var Solve = /** @class */ (function () {
    function Solve(initialBoard) {
        this.initialBoard = initialBoard;
    }
    Solve.prototype.execute = function () {
        var lockedTiles = _lockedTiles__WEBPACK_IMPORTED_MODULE_2__.LockedTiles.getInstance();
        var board = this.initialBoard;
        board = this.bfs(board, new PositionOneTile('0', 0));
        lockedTiles.lock(0);
        board = this.bfs(board, new PositionOneTile('1', 1));
        lockedTiles.lock(1);
        board = this.bfs(board, new PositionOneTile('4', 4));
        lockedTiles.lock(4);
        board = this.bfs(board, new PositionOneTile('5', 5));
        lockedTiles.lock(5);
        board = this.bfs(board, new PositionManyTiles([['2', 3], ['3', 10], [_board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE, 6]]));
        board = this.applyFormula(board);
        lockedTiles.lock(2);
        lockedTiles.lock(3);
        board = this.bfs(board, new PositionManyTiles([['6', 7], ['7', 14], [_board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE, 10]]));
        board = this.applyFormula(board);
        lockedTiles.lock(6);
        lockedTiles.lock(7);
        board = this.bfs(board, new PositionManyTiles([['8', 8], ['9', 9], ['A', 10], ['B', 11], ['C', 12], ['D', 13], ['E', 14], ['F', 15]]));
        lockedTiles.reset();
        return board;
    };
    Solve.prototype.bfs = function (initialBoard, solveStrategy) {
        var heap = new _datastructures_js_priority_queue__WEBPACK_IMPORTED_MODULE_0__.PriorityQueue(solveStrategy.buildCompareBoards());
        heap.push(initialBoard);
        var visitedStates = new Set();
        var board;
        while (true) {
            board = heap.pop();
            if (visitedStates.has(board.state))
                continue;
            if (solveStrategy.solved(board))
                break;
            for (var _i = 0, _a = [board.goUp.bind(board), board.goLeft.bind(board), board.goDown.bind(board), board.goRight.bind(board)]; _i < _a.length; _i++) {
                var go = _a[_i];
                var nextBoard = go();
                if (nextBoard !== null && !visitedStates.has(nextBoard.state))
                    heap.push(nextBoard);
            }
            visitedStates.add(board.state);
        }
        return board;
    };
    Solve.prototype.applyFormula = function (board) {
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
    };
    return Solve;
}());

var PositionOneTile = /** @class */ (function () {
    function PositionOneTile(tile, destIndex) {
        this.tile = tile;
        this.destIndex = destIndex;
    }
    PositionOneTile.prototype.solved = function (board) {
        return board.state[this.destIndex] === this.tile;
    };
    PositionOneTile.prototype.buildCompareBoards = function () {
        var _this = this;
        return function (a, b) { return _this.calcManhattanDistance(a) < _this.calcManhattanDistance(b) ? -1 : 1; };
    };
    PositionOneTile.prototype.calcManhattanDistance = function (board) {
        var blankTileIndex = board.state.indexOf(_board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE);
        var index = board.state.indexOf(this.tile);
        var curCol = calcCol(index);
        var curRow = calcRow(index);
        var destCol;
        var destRow;
        if (near(index, blankTileIndex) || this.tile == _board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE) {
            destCol = calcCol(this.destIndex);
            destRow = calcRow(this.destIndex);
        }
        else {
            destCol = calcCol(blankTileIndex);
            destRow = calcRow(blankTileIndex);
        }
        return Math.abs(curCol - destCol) + Math.abs(curRow - destRow);
    };
    return PositionOneTile;
}());
var PositionManyTiles = /** @class */ (function () {
    function PositionManyTiles(listOfTileAndDestIndex) {
        this.listOfTileAndDestIndex = listOfTileAndDestIndex;
    }
    PositionManyTiles.prototype.solved = function (board) {
        return this.listOfTileAndDestIndex.every(function (tileAndDestIndex) { return board.state[tileAndDestIndex[1]] === tileAndDestIndex[0]; });
    };
    PositionManyTiles.prototype.buildCompareBoards = function () {
        var _this = this;
        return function (a, b) { return _this.calcManhattanDistance(a) < _this.calcManhattanDistance(b) ? -1 : 1; };
    };
    PositionManyTiles.prototype.calcManhattanDistance = function (board) {
        var distance = 0;
        for (var _i = 0, _a = this.listOfTileAndDestIndex; _i < _a.length; _i++) {
            var tileAndDestIndex = _a[_i];
            var index = board.state.indexOf(tileAndDestIndex[0]);
            var curCol = calcCol(index);
            var curRow = calcRow(index);
            var destCol = calcCol(tileAndDestIndex[1]);
            var destRow = calcRow(tileAndDestIndex[1]);
            distance += Math.abs(curCol - destCol) + Math.abs(curRow - destRow);
        }
        return distance;
    };
    return PositionManyTiles;
}());
function near(index1, index2) {
    var col1 = calcCol(index1);
    var row1 = calcRow(index1);
    var col2 = calcCol(index2);
    var row2 = calcRow(index2);
    return (Math.abs(col1 - col2) == 1 && row1 === row2 ||
        Math.abs(row1 - row2) == 1 && col1 === col2);
}
function calcCol(index) {
    return Math.floor(index / 4);
}
function calcRow(index) {
    return index % 4;
}


/***/ }),
/* 3 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { MinPriorityQueue } = __webpack_require__(4);
const { MaxPriorityQueue } = __webpack_require__(9);
const { PriorityQueue } = __webpack_require__(10)

module.exports = { MinPriorityQueue, MaxPriorityQueue, PriorityQueue };


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const { Heap, MinHeap } = __webpack_require__(5);

const getMinCompare = (getCompareValue) => (a, b) => {
  const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
  const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
  return aVal < bVal ? -1 : 1;
};

/**
 * @class MinPriorityQueue
 */
class MinPriorityQueue {
  constructor(getCompareValue, _heap) {
    if (getCompareValue && typeof getCompareValue !== 'function') {
      throw new Error('MinPriorityQueue constructor requires a callback for object values');
    }
    this._heap = _heap || new MinHeap(getCompareValue);
  }

  /**
   * Returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  front() {
    return this._heap.root();
  }

  /**
   * Returns an element with lowest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  back() {
    return this._heap.leaf();
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {MinPriorityQueue}
   */
  enqueue(value) {
    return this._heap.insert(value);
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {MinPriorityQueue}
   */
  push(value) {
    return this.enqueue(value);
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  dequeue() {
    return this._heap.extractRoot();
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.dequeue();
  }

  /**
   * Returns the number of elements in the queue
   * @public
   * @returns {number}
   */
  size() {
    return this._heap.size();
  }

  /**
   * Checks if the queue is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this._heap.isEmpty();
  }

  /**
   * Clears the queue
   * @public
   */
  clear() {
    this._heap.clear();
  }

  /**
   * Returns a sorted list of elements from highest to lowest priority
   * @public
   * @returns {array}
   */
  toArray() {
    return this._heap.clone().sort().reverse();
  }

  /**
   * Implements an iterable on the min priority queue
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Creates a priority queue from an existing array
   * @public
   * @static
   * @returns {MinPriorityQueue}
   */
  static fromArray(values, getCompareValue) {
    const heap = new Heap(getMinCompare(getCompareValue), values);
    return new MinPriorityQueue(
      getCompareValue,
      new MinHeap(getCompareValue, heap).fix()
    );
  }
}

exports.MinPriorityQueue = MinPriorityQueue;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { Heap } = __webpack_require__(6);
const { MinHeap } = __webpack_require__(7);
const { MaxHeap } = __webpack_require__(8);

exports.Heap = Heap;
exports.MinHeap = MinHeap;
exports.MaxHeap = MaxHeap;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {

/**
 * @license MIT
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 *
 * @class
 */
class Heap {
  /**
   * @param {function} compare
   * @param {array} [_values]
   * @param {number|string|object} [_leaf]
   */
  constructor(compare, _values, _leaf) {
    if (typeof compare !== 'function') {
      throw new Error('Heap constructor expects a compare function');
    }
    this._compare = compare;
    this._nodes = Array.isArray(_values) ? _values : [];
    this._leaf = _leaf || null;
  }

  /**
   * Converts the heap to a cloned array without sorting.
   * @public
   * @returns {Array}
   */
  toArray() {
    return Array.from(this._nodes);
  }

  /**
   * Checks if a parent has a left child
   * @private
   */
  _hasLeftChild(parentIndex) {
    const leftChildIndex = (parentIndex * 2) + 1;
    return leftChildIndex < this.size();
  }

  /**
   * Checks if a parent has a right child
   * @private
   */
  _hasRightChild(parentIndex) {
    const rightChildIndex = (parentIndex * 2) + 2;
    return rightChildIndex < this.size();
  }

  /**
   * Compares two nodes
   * @private
   */
  _compareAt(i, j) {
    return this._compare(this._nodes[i], this._nodes[j]);
  }

  /**
   * Swaps two nodes in the heap
   * @private
   */
  _swap(i, j) {
    const temp = this._nodes[i];
    this._nodes[i] = this._nodes[j];
    this._nodes[j] = temp;
  }

  /**
   * Checks if parent and child should be swapped
   * @private
   */
  _shouldSwap(parentIndex, childIndex) {
    if (parentIndex < 0 || parentIndex >= this.size()) {
      return false;
    }

    if (childIndex < 0 || childIndex >= this.size()) {
      return false;
    }

    return this._compareAt(parentIndex, childIndex) > 0;
  }

  /**
   * Compares children of a parent
   * @private
   */
  _compareChildrenOf(parentIndex) {
    if (!this._hasLeftChild(parentIndex) && !this._hasRightChild(parentIndex)) {
      return -1;
    }

    const leftChildIndex = (parentIndex * 2) + 1;
    const rightChildIndex = (parentIndex * 2) + 2;

    if (!this._hasLeftChild(parentIndex)) {
      return rightChildIndex;
    }

    if (!this._hasRightChild(parentIndex)) {
      return leftChildIndex;
    }

    const compare = this._compareAt(leftChildIndex, rightChildIndex);
    return compare > 0 ? rightChildIndex : leftChildIndex;
  }

  /**
   * Compares two children before a position
   * @private
   */
  _compareChildrenBefore(index, leftChildIndex, rightChildIndex) {
    const compare = this._compareAt(rightChildIndex, leftChildIndex);

    if (compare <= 0 && rightChildIndex < index) {
      return rightChildIndex;
    }

    return leftChildIndex;
  }

  /**
   * Recursively bubbles up a node if it's in a wrong position
   * @private
   */
  _heapifyUp(startIndex) {
    let childIndex = startIndex;
    let parentIndex = Math.floor((childIndex - 1) / 2);

    while (this._shouldSwap(parentIndex, childIndex)) {
      this._swap(parentIndex, childIndex);
      childIndex = parentIndex;
      parentIndex = Math.floor((childIndex - 1) / 2);
    }
  }

  /**
   * Recursively bubbles down a node if it's in a wrong position
   * @private
   */
  _heapifyDown(startIndex) {
    let parentIndex = startIndex;
    let childIndex = this._compareChildrenOf(parentIndex);

    while (this._shouldSwap(parentIndex, childIndex)) {
      this._swap(parentIndex, childIndex);
      parentIndex = childIndex;
      childIndex = this._compareChildrenOf(parentIndex);
    }
  }

  /**
   * Recursively bubbles down a node before a given index
   * @private
   */
  _heapifyDownUntil(index) {
    let parentIndex = 0;
    let leftChildIndex = 1;
    let rightChildIndex = 2;
    let childIndex;

    while (leftChildIndex < index) {
      childIndex = this._compareChildrenBefore(
        index,
        leftChildIndex,
        rightChildIndex
      );

      if (this._shouldSwap(parentIndex, childIndex)) {
        this._swap(parentIndex, childIndex);
      }

      parentIndex = childIndex;
      leftChildIndex = (parentIndex * 2) + 1;
      rightChildIndex = (parentIndex * 2) + 2;
    }
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {Heap}
   */
  insert(value) {
    this._nodes.push(value);
    this._heapifyUp(this.size() - 1);
    if (this._leaf === null || this._compare(value, this._leaf) > 0) {
      this._leaf = value;
    }
    return this;
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {Heap}
   */
  push(value) {
    return this.insert(value);
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  extractRoot() {
    if (this.isEmpty()) {
      return null;
    }

    const root = this.root();
    this._nodes[0] = this._nodes[this.size() - 1];
    this._nodes.pop();
    this._heapifyDown(0);

    if (root === this._leaf) {
      this._leaf = this.root();
    }

    return root;
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.extractRoot();
  }

  /**
   * Applies heap sort and return the values sorted by priority
   * @public
   * @returns {array}
   */
  sort() {
    for (let i = this.size() - 1; i > 0; i -= 1) {
      this._swap(0, i);
      this._heapifyDownUntil(i);
    }
    return this._nodes;
  }

  /**
   * Fixes node positions in the heap
   * @public
   * @returns {Heap}
   */
  fix() {
    // fix node positions
    for (let i = Math.floor(this.size() / 2) - 1; i >= 0; i -= 1) {
      this._heapifyDown(i);
    }

    // fix leaf value
    for (let i = Math.floor(this.size() / 2); i < this.size(); i += 1) {
      const value = this._nodes[i];
      if (this._leaf === null || this._compare(value, this._leaf) > 0) {
        this._leaf = value;
      }
    }

    return this;
  }

  /**
   * Verifies that all heap nodes are in the right position
   * @public
   * @returns {boolean}
   */
  isValid() {
    const isValidRecursive = (parentIndex) => {
      let isValidLeft = true;
      let isValidRight = true;

      if (this._hasLeftChild(parentIndex)) {
        const leftChildIndex = (parentIndex * 2) + 1;
        if (this._compareAt(parentIndex, leftChildIndex) > 0) {
          return false;
        }
        isValidLeft = isValidRecursive(leftChildIndex);
      }

      if (this._hasRightChild(parentIndex)) {
        const rightChildIndex = (parentIndex * 2) + 2;
        if (this._compareAt(parentIndex, rightChildIndex) > 0) {
          return false;
        }
        isValidRight = isValidRecursive(rightChildIndex);
      }

      return isValidLeft && isValidRight;
    };

    return isValidRecursive(0);
  }

  /**
   * Returns a shallow copy of the heap
   * @public
   * @returns {Heap}
   */
  clone() {
    return new Heap(this._compare, this._nodes.slice(), this._leaf);
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  root() {
    if (this.isEmpty()) {
      return null;
    }

    return this._nodes[0];
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  top() {
    return this.root();
  }

  /**
   * Returns a leaf node in the heap
   * @public
   * @returns {number|string|object}
   */
  leaf() {
    return this._leaf;
  }

  /**
   * Returns the number of nodes in the heap
   * @public
   * @returns {number}
   */
  size() {
    return this._nodes.length;
  }

  /**
   * Checks if the heap is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this.size() === 0;
  }

  /**
   * Clears the heap
   * @public
   */
  clear() {
    this._nodes = [];
    this._leaf = null;
  }

  /**
   * Implements an iterable on the heap
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Builds a heap from a array of values
   * @public
   * @static
   * @param {array} values
   * @param {function} compare
   * @returns {Heap}
   */
  static heapify(values, compare) {
    if (!Array.isArray(values)) {
      throw new Error('Heap.heapify expects an array of values');
    }

    if (typeof compare !== 'function') {
      throw new Error('Heap.heapify expects a compare function');
    }

    return new Heap(compare, values).fix();
  }

  /**
   * Checks if a list of values is a valid heap
   * @public
   * @static
   * @param {array} values
   * @param {function} compare
   * @returns {boolean}
   */
  static isHeapified(values, compare) {
    return new Heap(compare, values).isValid();
  }
}

exports.Heap = Heap;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license MIT
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 */

const { Heap } = __webpack_require__(6);

const getMinCompare = (getCompareValue) => (a, b) => {
  const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
  const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
  return aVal < bVal ? -1 : 1;
};

/**
 * @class MinHeap
 * @extends Heap
 */
class MinHeap {
  /**
   * @param {function} [getCompareValue]
   * @param {Heap} [_heap]
   */
  constructor(getCompareValue, _heap) {
    this._getCompareValue = getCompareValue;
    this._heap = _heap || new Heap(getMinCompare(getCompareValue));
  }

  /**
   * Converts the heap to a cloned array without sorting.
   * @public
   * @returns {Array}
   */
  toArray() {
    return Array.from(this._heap._nodes);
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {MinHeap}
   */
  insert(value) {
    return this._heap.insert(value);
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {Heap}
   */
  push(value) {
    return this.insert(value);
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  extractRoot() {
    return this._heap.extractRoot();
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.extractRoot();
  }

  /**
   * Applies heap sort and return the values sorted by priority
   * @public
   * @returns {array}
   */
  sort() {
    return this._heap.sort();
  }

  /**
   * Fixes node positions in the heap
   * @public
   * @returns {MinHeap}
   */
  fix() {
    return this._heap.fix();
  }

  /**
   * Verifies that all heap nodes are in the right position
   * @public
   * @returns {boolean}
   */
  isValid() {
    return this._heap.isValid();
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  root() {
    return this._heap.root();
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  top() {
    return this.root();
  }

  /**
   * Returns a leaf node in the heap
   * @public
   * @returns {number|string|object}
   */
  leaf() {
    return this._heap.leaf();
  }

  /**
   * Returns the number of nodes in the heap
   * @public
   * @returns {number}
   */
  size() {
    return this._heap.size();
  }

  /**
   * Checks if the heap is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this._heap.isEmpty();
  }

  /**
   * Clears the heap
   * @public
   */
  clear() {
    this._heap.clear();
  }

  /**
   * Returns a shallow copy of the MinHeap
   * @public
   * @returns {MinHeap}
   */
  clone() {
    return new MinHeap(this._getCompareValue, this._heap.clone());
  }

  /**
   * Implements an iterable on the heap
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Builds a MinHeap from an array
   * @public
   * @static
   * @param {array} values
   * @param {function} [getCompareValue]
   * @returns {MinHeap}
   */
  static heapify(values, getCompareValue) {
    if (!Array.isArray(values)) {
      throw new Error('MinHeap.heapify expects an array');
    }
    const heap = new Heap(getMinCompare(getCompareValue), values);
    return new MinHeap(getCompareValue, heap).fix();
  }

  /**
   * Checks if a list of values is a valid min heap
   * @public
   * @static
   * @param {array} values
   * @param {function} [getCompareValue]
   * @returns {boolean}
   */
  static isHeapified(values, getCompareValue) {
    const heap = new Heap(getMinCompare(getCompareValue), values);
    return new MinHeap(getCompareValue, heap).isValid();
  }
}

exports.MinHeap = MinHeap;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license MIT
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 */

const { Heap } = __webpack_require__(6);

const getMaxCompare = (getCompareValue) => (a, b) => {
  const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
  const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
  return aVal < bVal ? 1 : -1;
};

/**
 * @class MaxHeap
 * @extends Heap
 */
class MaxHeap {
  /**
   * @param {function} [getCompareValue]
   * @param {Heap} [_heap]
   */
  constructor(getCompareValue, _heap) {
    this._getCompareValue = getCompareValue;
    this._heap = _heap || new Heap(getMaxCompare(getCompareValue));
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {MaxHeap}
   */
  insert(value) {
    return this._heap.insert(value);
  }

  /**
   * Inserts a new value into the heap
   * @public
   * @param {number|string|object} value
   * @returns {Heap}
   */
  push(value) {
    return this.insert(value);
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  extractRoot() {
    return this._heap.extractRoot();
  }

  /**
   * Removes and returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.extractRoot();
  }

  /**
   * Applies heap sort and return the values sorted by priority
   * @public
   * @returns {array}
   */
  sort() {
    return this._heap.sort();
  }

  /**
   * Converts the heap to a cloned array without sorting.
   * @public
   * @returns {Array}
   */
  toArray() {
    return Array.from(this._heap._nodes);
  }

  /**
   * Fixes node positions in the heap
   * @public
   * @returns {MaxHeap}
   */
  fix() {
    return this._heap.fix();
  }

  /**
   * Verifies that all heap nodes are in the right position
   * @public
   * @returns {boolean}
   */
  isValid() {
    return this._heap.isValid();
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  root() {
    return this._heap.root();
  }

  /**
   * Returns the root node in the heap
   * @public
   * @returns {number|string|object}
   */
  top() {
    return this.root();
  }

  /**
   * Returns a leaf node in the heap
   * @public
   * @returns {number|string|object}
   */
  leaf() {
    return this._heap.leaf();
  }

  /**
   * Returns the number of nodes in the heap
   * @public
   * @returns {number}
   */
  size() {
    return this._heap.size();
  }

  /**
   * Checks if the heap is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this._heap.isEmpty();
  }

  /**
   * Clears the heap
   * @public
   */
  clear() {
    this._heap.clear();
  }

  /**
   * Returns a shallow copy of the MaxHeap
   * @public
   * @returns {MaxHeap}
   */
  clone() {
    return new MaxHeap(this._getCompareValue, this._heap.clone());
  }

  /**
   * Implements an iterable on the heap
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Builds a MaxHeap from an array
   * @public
   * @static
   * @param {array} values
   * @param {function} [getCompareValue]
   * @returns {MaxHeap}
   */
  static heapify(values, getCompareValue) {
    if (!Array.isArray(values)) {
      throw new Error('MaxHeap.heapify expects an array');
    }
    const heap = new Heap(getMaxCompare(getCompareValue), values);
    return new MaxHeap(getCompareValue, heap).fix();
  }

  /**
   * Checks if a list of values is a valid max heap
   * @public
   * @static
   * @param {array} values
   * @param {function} [getCompareValue]
   * @returns {boolean}
   */
  static isHeapified(values, getCompareValue) {
    const heap = new Heap(getMaxCompare(getCompareValue), values);
    return new MaxHeap(getCompareValue, heap).isValid();
  }
}

exports.MaxHeap = MaxHeap;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const { Heap, MaxHeap } = __webpack_require__(5);

const getMaxCompare = (getCompareValue) => (a, b) => {
  const aVal = typeof getCompareValue === 'function' ? getCompareValue(a) : a;
  const bVal = typeof getCompareValue === 'function' ? getCompareValue(b) : b;
  return aVal < bVal ? 1 : -1;
};

/**
 * @class MaxPriorityQueue
 * @extends MaxHeap
 */
class MaxPriorityQueue {
  constructor(getCompareValue, _heap) {
    if (getCompareValue && typeof getCompareValue !== 'function') {
      throw new Error('MaxPriorityQueue constructor requires a callback for object values');
    }
    this._heap = _heap || new MaxHeap(getCompareValue);
  }

  /**
   * Returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  front() {
    return this._heap.root();
  }

  /**
   * Returns an element with lowest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  back() {
    return this._heap.leaf();
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {MaxPriorityQueue}
   */
  enqueue(value) {
    return this._heap.insert(value);
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {MaxPriorityQueue}
   */
  push(value) {
    return this.enqueue(value);
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  dequeue() {
    return this._heap.extractRoot();
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.dequeue();
  }

  /**
   * Returns the number of elements in the queue
   * @public
   * @returns {number}
   */
  size() {
    return this._heap.size();
  }

  /**
   * Checks if the queue is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this._heap.isEmpty();
  }

  /**
   * Clears the queue
   * @public
   */
  clear() {
    this._heap.clear();
  }

  /**
   * Returns a sorted list of elements from highest to lowest priority
   * @public
   * @returns {array}
   */
  toArray() {
    return this._heap.clone().sort().reverse();
  }

  /**
   * Implements an iterable on the min priority queue
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Creates a priority queue from an existing array
   * @public
   * @static
   * @returns {MaxPriorityQueue}
   */
  static fromArray(values, getCompareValue) {
    const heap = new Heap(getMaxCompare(getCompareValue), values);
    return new MaxPriorityQueue(
      getCompareValue,
      new MaxHeap(getCompareValue, heap).fix()
    );
  }
}

exports.MaxPriorityQueue = MaxPriorityQueue;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @copyright 2020 Eyas Ranjous <eyas.ranjous@gmail.com>
 * @license MIT
 */

const { Heap } = __webpack_require__(5);

/**
 * @class PriorityQueue
 */
class PriorityQueue {
  /**
   * Creates a priority queue
   * @params {function} compare
   */
  constructor(compare, _values) {
    if (typeof compare !== 'function') {
      throw new Error('PriorityQueue constructor expects a compare function');
    }
    this._heap = new Heap(compare, _values);
    if (_values) {
      this._heap.fix();
    }
  }

  /**
   * Returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  front() {
    return this._heap.root();
  }

  /**
   * Returns an element with lowest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  back() {
    return this._heap.leaf();
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {PriorityQueue}
   */
  enqueue(value) {
    return this._heap.insert(value);
  }

  /**
   * Adds a value to the queue
   * @public
   * @param {number|string|object} value
   * @returns {PriorityQueue}
   */
  push(value) {
    return this.enqueue(value);
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  dequeue() {
    return this._heap.extractRoot();
  }

  /**
   * Removes and returns an element with highest priority in the queue
   * @public
   * @returns {number|string|object}
   */
  pop() {
    return this.dequeue();
  }

  /**
   * Returns the number of elements in the queue
   * @public
   * @returns {number}
   */
  size() {
    return this._heap.size();
  }

  /**
   * Checks if the queue is empty
   * @public
   * @returns {boolean}
   */
  isEmpty() {
    return this._heap.isEmpty();
  }

  /**
   * Clears the queue
   * @public
   */
  clear() {
    this._heap.clear();
  }

  /**
   * Returns a sorted list of elements from highest to lowest priority
   * @public
   * @returns {array}
   */
  toArray() {
    return this._heap.clone().sort().reverse();
  }

  /**
   * Implements an iterable on the priority queue
   * @public
   */
  [Symbol.iterator]() {
    let size = this.size();
    return {
      next: () => {
        size -= 1;
        return {
          value: this.pop(),
          done: size === -1
        };
      }
    };
  }

  /**
   * Creates a priority queue from an existing array
   * @public
   * @static
   * @returns {PriorityQueue}
   */
  static fromArray(values, compare) {
    return new PriorityQueue(compare, values);
  }
}

exports.PriorityQueue = PriorityQueue;


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BLANK_TILE": () => (/* binding */ BLANK_TILE),
/* harmony export */   "Board": () => (/* binding */ Board),
/* harmony export */   "Direction": () => (/* binding */ Direction),
/* harmony export */   "SOLVED_BOARD_STATE": () => (/* binding */ SOLVED_BOARD_STATE),
/* harmony export */   "solvable": () => (/* binding */ solvable)
/* harmony export */ });
/* harmony import */ var _lockedTiles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(12);
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};

var SOLVED_BOARD_STATE = '0123456789ABCDEF';
var BLANK_TILE = 'F';
var Direction;
(function (Direction) {
    Direction["UP"] = "u";
    Direction["LEFT"] = "l";
    Direction["DOWN"] = "d";
    Direction["RIGHT"] = "r";
})(Direction || (Direction = {}));
var Board = /** @class */ (function () {
    function Board(state, path) {
        if (path === void 0) { path = []; }
        this.state = state;
        this.path = path;
        this.blankTileIndex = state.indexOf(BLANK_TILE);
    }
    Board.prototype.goUp = function () {
        var nextIndex = this.blankTileIndex - 4;
        if (nextIndex < 0 || _lockedTiles__WEBPACK_IMPORTED_MODULE_0__.LockedTiles.getInstance().locked(nextIndex))
            return null;
        return this.go(nextIndex, Direction.UP);
    };
    Board.prototype.goLeft = function () {
        var nextIndex = this.blankTileIndex - 1;
        if (this.blankTileIndex % 4 === 0 || _lockedTiles__WEBPACK_IMPORTED_MODULE_0__.LockedTiles.getInstance().locked(nextIndex))
            return null;
        return this.go(this.blankTileIndex - 1, Direction.LEFT);
    };
    Board.prototype.goDown = function () {
        var nextIndex = this.blankTileIndex + 4;
        if (nextIndex >= 16 || _lockedTiles__WEBPACK_IMPORTED_MODULE_0__.LockedTiles.getInstance().locked(nextIndex))
            return null;
        return this.go(nextIndex, Direction.DOWN);
    };
    Board.prototype.goRight = function () {
        var nextIndex = this.blankTileIndex + 1;
        if (this.blankTileIndex % 4 === 3 || _lockedTiles__WEBPACK_IMPORTED_MODULE_0__.LockedTiles.getInstance().locked(nextIndex))
            return null;
        return this.go(nextIndex, Direction.RIGHT);
    };
    Board.prototype.go = function (tileIndex, direction) {
        var firstIndex = this.blankTileIndex < tileIndex ? this.blankTileIndex : tileIndex;
        var secondIndex = this.blankTileIndex > tileIndex ? this.blankTileIndex : tileIndex;
        return new Board(this.state.slice(0, firstIndex) + this.state[secondIndex] +
            this.state.slice(firstIndex + 1, secondIndex) +
            this.state[firstIndex] + this.state.slice(secondIndex + 1), __spreadArray(__spreadArray([], this.path), [direction]));
    };
    return Board;
}());

function solvable(board) {
    var emptyBoxOnRowWithOddIndex = findEmptyBoxRowReversedIndex(board) & 1;
    var inversionsCountIsOddNumber = calcInversionsCount(board) & 1;
    return !!(emptyBoxOnRowWithOddIndex ^ inversionsCountIsOddNumber);
}
function findEmptyBoxRowReversedIndex(board) {
    var index = board.state.indexOf(BLANK_TILE);
    return 4 - Math.floor(index / 4);
}
function calcInversionsCount(board) {
    var count = 0;
    for (var i = 0; i < board.state.length - 1; i++) {
        for (var j = i + 1; j < board.state.length; j++) {
            if (board.state[i] !== BLANK_TILE &&
                board.state[j] !== BLANK_TILE &&
                board.state[i] > board.state[j]) {
                count++;
            }
        }
    }
    return count;
}


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LockedTiles": () => (/* binding */ LockedTiles)
/* harmony export */ });
var LockedTiles = /** @class */ (function () {
    function LockedTiles() {
        this.reset();
    }
    LockedTiles.getInstance = function () {
        if (!this.instance)
            this.instance = new LockedTiles();
        return this.instance;
    };
    LockedTiles.prototype.locked = function (index) {
        return this.state[index];
    };
    LockedTiles.prototype.lock = function (index) {
        this.state[index] = true;
    };
    LockedTiles.prototype.unlock = function (index) {
        this.state[index] = false;
    };
    LockedTiles.prototype.reset = function () {
        this.state = new Array(16).fill(false);
    };
    return LockedTiles;
}());



/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			0: 0,
/******/ 			1: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk_15puzzle"] = self["webpackChunk_15puzzle"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [1], () => (__webpack_require__(0)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;