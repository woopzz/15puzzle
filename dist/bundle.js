/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _game_board__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _game_shuffle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _game_solve__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);




var TILE_LABEL_TO_REPR = new Map([
    ['1', '0'], ['2', '1'], ['3', '2'], ['4', '3'],
    ['5', '4'], ['6', '5'], ['7', '6'], ['8', '7'],
    ['9', '8'], ['10', '9'], ['11', 'A'], ['12', 'B'],
    ['13', 'C'], ['14', 'D'], ['15', 'E'], ['0', 'F'],
]);
var TILE_REPR_TO_LABEL = new Map([
    ['0', '1'], ['1', '2'], ['2', '3'], ['3', '4'],
    ['4', '5'], ['5', '6'], ['6', '7'], ['7', '8'],
    ['8', '9'], ['9', '10'], ['A', '11'], ['B', '12'],
    ['C', '13'], ['D', '14'], ['E', '15'], ['F', '0'],
]);
function repaintUI(board, path) {
    var fieldNode = document.querySelector('.field');
    var wonMsgNode = document.querySelector('.won-msg');
    var boxNodes = fieldNode.children;
    for (var i = 0; i < board.state.length; i++) {
        var node = boxNodes[i];
        node.dataset.number = TILE_REPR_TO_LABEL.get(board.state[i]);
        node.style.backgroundColor = '';
    }
    if (path.length) {
        var boxNode = boxNodes[path.at(-1)];
        boxNode.style.backgroundColor = '#bbb';
    }
    wonMsgNode.style.display = (0,_game_board__WEBPACK_IMPORTED_MODULE_1__.solved)(board) ? 'block' : 'none';
}
var getShuffledBoard = function () { return new _game_shuffle__WEBPACK_IMPORTED_MODULE_2__.Shuffle(new _game_board__WEBPACK_IMPORTED_MODULE_1__.Board(_game_board__WEBPACK_IMPORTED_MODULE_1__.SOLVED_BOARD_STATE, [])).execute(); };
function init() {
    var board = getShuffledBoard();
    var path = [];
    var _repaintUI = function () { return repaintUI(board, path); };
    document.querySelector('.field').addEventListener('click', function (event) {
        var node = event.target;
        if (!node.classList.contains('box'))
            return;
        var tile = TILE_LABEL_TO_REPR.get(node.dataset.number);
        if (tile === undefined)
            return;
        var tileIndex = board.state.indexOf(tile);
        if (board.canBeMoved(tileIndex))
            board = board.move(tileIndex);
        if (path.length) {
            if (board.path.length && board.path.at(-1) === path.at(-1))
                path.pop();
            else
                path = [];
        }
        _repaintUI();
    });
    document.querySelector('.hint').addEventListener('click', function () {
        var solvedBoard = new _game_solve__WEBPACK_IMPORTED_MODULE_3__.Solve(board).execute();
        path = solvedBoard.path.reverse();
        _repaintUI();
    });
    document.querySelector('.shuffle').addEventListener('click', function () {
        board = getShuffledBoard();
        path = [];
        _repaintUI();
    });
    _repaintUI();
}
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
else
    init();


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BLANK_TILE": () => (/* binding */ BLANK_TILE),
/* harmony export */   "Board": () => (/* binding */ Board),
/* harmony export */   "SOLVED_BOARD_STATE": () => (/* binding */ SOLVED_BOARD_STATE),
/* harmony export */   "solvable": () => (/* binding */ solvable),
/* harmony export */   "solved": () => (/* binding */ solved)
/* harmony export */ });
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var SOLVED_BOARD_STATE = '0123456789ABCDEF';
var BLANK_TILE = 'F';
var Board = /** @class */ (function () {
    function Board(state, path) {
        if (path === void 0) { path = []; }
        this.state = state;
        this.path = path;
        this.blankTileIndex = state.indexOf(BLANK_TILE);
    }
    Board.prototype.canBeMoved = function (tileIndex) {
        if (tileIndex < 0 || tileIndex > 15)
            return false;
        return ((tileIndex - 4 === this.blankTileIndex) ||
            (tileIndex + 4 === this.blankTileIndex) ||
            (tileIndex - 1 === this.blankTileIndex && tileIndex % 4 !== 0) ||
            (tileIndex + 1 === this.blankTileIndex && tileIndex % 4 !== 3));
    };
    Board.prototype.move = function (tileIndex) {
        var firstIndex = this.blankTileIndex < tileIndex ? this.blankTileIndex : tileIndex;
        var secondIndex = this.blankTileIndex > tileIndex ? this.blankTileIndex : tileIndex;
        return new Board(this.state.slice(0, firstIndex) + this.state[secondIndex] +
            this.state.slice(firstIndex + 1, secondIndex) +
            this.state[firstIndex] + this.state.slice(secondIndex + 1), __spreadArray(__spreadArray([], this.path), [tileIndex]));
    };
    return Board;
}());

function solved(board) {
    return board.state === SOLVED_BOARD_STATE;
}
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
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Shuffle": () => (/* binding */ Shuffle)
/* harmony export */ });
/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);

var Shuffle = /** @class */ (function () {
    function Shuffle(board) {
        this.board = board;
    }
    Shuffle.prototype.execute = function () {
        while (true) {
            this.shuffle();
            if ((0,_board__WEBPACK_IMPORTED_MODULE_0__.solvable)(this.board) && !(0,_board__WEBPACK_IMPORTED_MODULE_0__.solved)(this.board))
                break;
        }
        return this.board;
    };
    Shuffle.prototype.shuffle = function () {
        var tiles = Array.from(this.board.state);
        for (var index = tiles.length - 1; index > 0; index--) {
            var anotherIndex = Math.floor(Math.random() * index);
            var tmp = tiles[index];
            tiles[index] = tiles[anotherIndex];
            tiles[anotherIndex] = tmp;
        }
        this.board = new _board__WEBPACK_IMPORTED_MODULE_0__.Board(tiles.join(''));
    };
    return Shuffle;
}());



/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Solve": () => (/* binding */ Solve)
/* harmony export */ });
/* harmony import */ var _misc_priorityQueue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony import */ var _board__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _lockedTiles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);



var calcIndexOfTileAbove = function (board) { return board.blankTileIndex - 4; };
var calcIndexOfTileOnTheLeft = function (board) { return board.blankTileIndex - 1; };
var calcIndexOfTileBelow = function (board) { return board.blankTileIndex + 4; };
var calcIndexOfTileOnTheRight = function (board) { return board.blankTileIndex + 1; };
function checkTilesOnTheirPlaces(board, tiles) {
    return tiles.filter(function (tile) { return board.state.indexOf(tile) !== _board__WEBPACK_IMPORTED_MODULE_1__.SOLVED_BOARD_STATE.indexOf(tile); }).length === 0;
}
var Solve = /** @class */ (function () {
    function Solve(initialBoard) {
        this.initialBoard = new _board__WEBPACK_IMPORTED_MODULE_1__.Board(initialBoard.state);
        this.lockedTiles = new _lockedTiles__WEBPACK_IMPORTED_MODULE_2__.LockedTiles();
    }
    Solve.prototype.execute = function () {
        var board = this.initialBoard;
        if (!checkTilesOnTheirPlaces(board, ['0']))
            board = this.bfs(board, new PositionOneTile('0', 0));
        this.lockedTiles.lock(0);
        if (!checkTilesOnTheirPlaces(board, ['1']))
            board = this.bfs(board, new PositionOneTile('1', 1));
        this.lockedTiles.lock(1);
        if (!checkTilesOnTheirPlaces(board, ['4']))
            board = this.bfs(board, new PositionOneTile('4', 4));
        this.lockedTiles.lock(4);
        if (!checkTilesOnTheirPlaces(board, ['5']))
            board = this.bfs(board, new PositionOneTile('5', 5));
        this.lockedTiles.lock(5);
        if (!checkTilesOnTheirPlaces(board, ['2', '3'])) {
            board = this.bfs(board, new PositionManyTiles([['2', 3], ['3', 10], [_board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE, 6]]));
            board = this.applyFormula(board);
        }
        this.lockedTiles.lock(2);
        this.lockedTiles.lock(3);
        if (!checkTilesOnTheirPlaces(board, ['6', '7'])) {
            board = this.bfs(board, new PositionManyTiles([['6', 7], ['7', 14], [_board__WEBPACK_IMPORTED_MODULE_1__.BLANK_TILE, 10]]));
            board = this.applyFormula(board);
        }
        this.lockedTiles.lock(6);
        this.lockedTiles.lock(7);
        if (!checkTilesOnTheirPlaces(board, ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F'])) {
            board = this.bfs(board, new PositionManyTiles([['8', 8], ['9', 9], ['A', 10], ['B', 11], ['C', 12], ['D', 13], ['E', 14], ['F', 15]]));
        }
        return board;
    };
    Solve.prototype.bfs = function (initialBoard, solveStrategy) {
        var heap = new _misc_priorityQueue__WEBPACK_IMPORTED_MODULE_0__.PriorityQueue();
        heap.insert(initialBoard, solveStrategy.calcHeuristic(initialBoard));
        var visitedStates = new Set();
        var board;
        while (true) {
            board = heap.extractMin();
            if (visitedStates.has(board.state))
                continue;
            if (solveStrategy.solved(board))
                break;
            for (var _i = 0, _a = [
                calcIndexOfTileAbove(board), calcIndexOfTileOnTheLeft(board),
                calcIndexOfTileBelow(board), calcIndexOfTileOnTheRight(board),
            ]; _i < _a.length; _i++) {
                var tileIndex = _a[_i];
                if (board.canBeMoved(tileIndex) && !this.lockedTiles.locked(tileIndex)) {
                    var nextBoard = board.move(tileIndex);
                    if (!visitedStates.has(nextBoard.state))
                        heap.insert(nextBoard, solveStrategy.calcHeuristic(nextBoard));
                }
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
    PositionOneTile.prototype.calcHeuristic = function (board) {
        return this.calcManhattanDistance(board) + board.path.length;
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
    PositionManyTiles.prototype.calcHeuristic = function (board) {
        return this.calcManhattanDistance(board) + board.path.length;
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
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PriorityQueue": () => (/* binding */ PriorityQueue)
/* harmony export */ });
var PriorityQueue = /** @class */ (function () {
    function PriorityQueue() {
        this.queue = new Map();
    }
    PriorityQueue.prototype.insert = function (item, priority) {
        if (this.queue.has(priority))
            this.queue.get(priority).push(item);
        else
            this.queue.set(priority, [item]);
    };
    PriorityQueue.prototype.extractMin = function () {
        this.throwErrorIfEmpty();
        var minPriority = this.findSmallestPriority();
        var minItems = this.queue.get(minPriority);
        var minItem = minItems[0];
        if (minItems.length === 1)
            this.queue.delete(minPriority);
        else
            minItems.shift();
        return minItem;
    };
    PriorityQueue.prototype.throwErrorIfEmpty = function () {
        if (this.queue.size === 0)
            throw new Error('The queue is empty.');
    };
    PriorityQueue.prototype.findSmallestPriority = function () {
        var minPriority = Infinity;
        this.queue.forEach(function (item, priority) {
            if (priority < minPriority)
                minPriority = priority;
        });
        return minPriority;
    };
    return PriorityQueue;
}());



/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "LockedTiles": () => (/* binding */ LockedTiles)
/* harmony export */ });
var LockedTiles = /** @class */ (function () {
    function LockedTiles() {
        this.state = new Array(16).fill(false);
    }
    LockedTiles.prototype.locked = function (index) {
        return this.state[index];
    };
    LockedTiles.prototype.lock = function (index) {
        this.state[index] = true;
    };
    LockedTiles.prototype.unlock = function (index) {
        this.state[index] = false;
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