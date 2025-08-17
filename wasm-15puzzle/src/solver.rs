use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashSet};

use rand::seq::SliceRandom;
use rand::thread_rng;

pub const TILES_COUNT: usize = 16;

pub type Tile = &'static str;
pub type Tiles = [Tile; TILES_COUNT];
pub type TileIndex = usize;
pub type Path = Vec<TileIndex>;

pub const SOLVED_BOARD_STATE: Tiles = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "0",
];
pub const BLANK_TILE: Tile = "0";

pub struct Board {
    pub state: Tiles,
    pub path: Path,
}

impl Board {
    pub fn move_tile(&self, tile: &str) -> Option<Board> {
        let index = self.state.iter().position(|&x| x == tile)?;
        match self.check_step(index) {
            true => Some(self.step(index)),
            false => None,
        }
    }

    pub fn check_step(&self, tile_index: TileIndex) -> bool {
        if tile_index < 0 || tile_index > 15 {
            return false;
        }

        let blank_tile_index = self.get_blank_tile_index();
        return (tile_index >= 4 && tile_index - 4 == blank_tile_index)
            || (tile_index + 4 == blank_tile_index)
            || (tile_index >= 1 && tile_index - 1 == blank_tile_index && tile_index % 4 != 0)
            || (tile_index + 1 == blank_tile_index && tile_index % 4 != 3);
    }

    pub fn step(&self, tile_index: TileIndex) -> Board {
        let mut state = self.state.clone();
        let blank_tile_index = self.get_blank_tile_index();
        state[blank_tile_index] = state[tile_index];
        state[tile_index] = BLANK_TILE;

        let mut path = self.path.clone();
        path.push(tile_index);

        return Board { state, path };
    }

    pub fn shuffle(&mut self) -> &mut Self {
        let mut rng = thread_rng();
        loop {
            self.state.shuffle(&mut rng);
            if self.check_solvable() && !self.check_solved() {
                return self;
            }
        }
    }

    fn get_blank_tile_index(&self) -> TileIndex {
        return self.state.iter().position(|&x| x == BLANK_TILE).unwrap();
    }

    fn check_solvable(&self) -> bool {
        let empty_box_on_row_with_ddd_index = self.find_empty_box_row_reversed_index() & 1;
        let inversions_count_is_odd_number = self.calc_inversions_count() & 1;
        return (empty_box_on_row_with_ddd_index ^ inversions_count_is_odd_number) != 0;
    }

    pub fn check_solved(&self) -> bool {
        return self.state == SOLVED_BOARD_STATE;
    }

    fn find_empty_box_row_reversed_index(&self) -> u16 {
        let index = self.state.iter().position(|&x| x == BLANK_TILE).unwrap();
        return 4 - (((index / 4) as f32).floor() as u16);
    }

    fn calc_inversions_count(&self) -> u16 {
        let mut count = 0;
        let length = self.state.len();

        for i in 0..length {
            for j in (i + 1)..length {
                if self.state[i] != BLANK_TILE
                    && self.state[j] != BLANK_TILE
                    && self.state[i] > self.state[j]
                {
                    count += 1;
                }
            }
        }

        return count;
    }
}

struct LockedTiles {
    state: [bool; TILES_COUNT],
}

impl LockedTiles {
    fn new() -> LockedTiles {
        let state = [
            false, false, false, false, false, false, false, false, false, false, false, false,
            false, false, false, false,
        ];
        return LockedTiles { state };
    }

    fn check_locked(&self, tile_index: TileIndex) -> bool {
        return self.state[tile_index];
    }

    fn lock(&mut self, tile_index: TileIndex) {
        self.state[tile_index] = true;
    }
}

struct RankedBoard(i32, Board);

impl Ord for RankedBoard {
    fn cmp(&self, other: &Self) -> Ordering {
        return self.0.cmp(&other.0);
    }
}

impl PartialOrd for RankedBoard {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        return Some(self.cmp(other));
    }
}

impl PartialEq for RankedBoard {
    fn eq(&self, other: &Self) -> bool {
        return self.0 == other.0;
    }
}

impl Eq for RankedBoard {}

pub struct Autosolver {
    locked_tiles: LockedTiles,
}

impl Autosolver {
    pub fn new() -> Autosolver {
        let locked_tiles = LockedTiles::new();
        return Autosolver { locked_tiles };
    }

    pub fn execute(&mut self, state: Tiles) -> Path {
        let mut board = Board {
            state,
            path: vec![],
        };

        if !self.check_tiles_on_their_places(&board, HashSet::from(["1"])) {
            board = self.bfs(
                board,
                PositionOneTile {
                    tile: "1",
                    dest_index: 0,
                },
            );
        }
        self.locked_tiles.lock(0);

        if !self.check_tiles_on_their_places(&board, HashSet::from(["2"])) {
            board = self.bfs(
                board,
                PositionOneTile {
                    tile: "2",
                    dest_index: 1,
                },
            );
        }
        self.locked_tiles.lock(1);

        if !self.check_tiles_on_their_places(&board, HashSet::from(["5"])) {
            board = self.bfs(
                board,
                PositionOneTile {
                    tile: "5",
                    dest_index: 4,
                },
            );
        }
        self.locked_tiles.lock(4);

        if !self.check_tiles_on_their_places(&board, HashSet::from(["6"])) {
            board = self.bfs(
                board,
                PositionOneTile {
                    tile: "6",
                    dest_index: 5,
                },
            );
        }
        self.locked_tiles.lock(5);

        if !self.check_tiles_on_their_places(&board, HashSet::from(["3", "4"])) {
            board = self.bfs(
                board,
                PositionManyTiles {
                    tiles: vec!["3", "4", BLANK_TILE],
                    dest_indexes: vec![3, 10, 6],
                },
            );
            board = self.apply_formula(board);
        }
        self.locked_tiles.lock(2);
        self.locked_tiles.lock(3);

        if !self.check_tiles_on_their_places(&board, HashSet::from(["7", "8"])) {
            board = self.bfs(
                board,
                PositionManyTiles {
                    tiles: vec!["7", "8", BLANK_TILE],
                    dest_indexes: vec![7, 14, 10],
                },
            );
            board = self.apply_formula(board);
        }
        self.locked_tiles.lock(6);
        self.locked_tiles.lock(7);

        if !self.check_tiles_on_their_places(
            &board,
            HashSet::from(["9", "10", "11", "12", "13", "14", "15", "0"]),
        ) {
            board = self.bfs(
                board,
                PositionManyTiles {
                    tiles: vec!["9", "10", "11", "12", "13", "14", "15", "0"],
                    dest_indexes: vec![8, 9, 10, 11, 12, 13, 14, 15],
                },
            );
        }

        return board.path;
    }

    fn check_tiles_on_their_places(&self, board: &Board, tiles: HashSet<Tile>) -> bool {
        for (tile, solved_board_tile) in board.state.iter().zip(SOLVED_BOARD_STATE.iter()) {
            if tiles.contains(solved_board_tile) && tile != solved_board_tile {
                return false;
            }
        }
        return true;
    }

    fn bfs(&self, initial_board: Board, solve_strategy: impl SolveStrategy) -> Board {
        let mut heap = BinaryHeap::new();
        heap.push(RankedBoard(
            solve_strategy.calc_heuristic(&initial_board),
            initial_board,
        ));

        let mut visited_states: HashSet<Tiles> = HashSet::new();

        loop {
            let board = heap.pop().unwrap().1;

            if visited_states.contains(&board.state) {
                continue;
            }

            if solve_strategy.check_solved(&board) {
                return board;
            }

            for maybe_tile_index in [
                self.calc_index_of_tile_above(&board),
                self.calc_index_of_tile_on_the_left(&board),
                self.calc_index_of_tile_below(&board),
                self.calc_index_of_tile_on_the_right(&board),
            ] {
                if maybe_tile_index.is_none() {
                    continue;
                }
                let tile_index = maybe_tile_index.unwrap();
                if board.check_step(tile_index) && !self.locked_tiles.check_locked(tile_index) {
                    let next_board = board.step(tile_index);
                    if !visited_states.contains(&next_board.state) {
                        heap.push(RankedBoard(
                            solve_strategy.calc_heuristic(&next_board),
                            next_board,
                        ));
                    }
                }
            }

            visited_states.insert(board.state);
        }
    }

    fn apply_formula(&self, mut board: Board) -> Board {
        //  Sometimes to move a tile on its place you have to rotate a box 2x2.
        //  It means you have to move the previously set tile. For example:
        //
        //  0 1 2 6
        //  7 A F 5
        //  C 8 3 4
        //  B 9 E D
        //
        //  You have no way to put the tile '3' on its position wihout moving the tile '2'.
        //  So here we manually perform a formula to put the last tile in a row on its place.
        //
        //  In order to do so, we require a special configuration:
        //
        //  x x x 2
        //  x x F x
        //  x x 3 x
        //  x x x x
        //
        //  After this we'll get ...
        //
        //  x x 2 3
        //  x x F x
        //  x x x x
        //  x x x x
        //
        //  It's true for the second row as well (tiles '6' and '7').
        board = board.step(self.calc_index_of_tile_below(&board).unwrap());
        board = board.step(self.calc_index_of_tile_on_the_right(&board).unwrap());
        board = board.step(self.calc_index_of_tile_above(&board).unwrap());
        board = board.step(self.calc_index_of_tile_above(&board).unwrap());
        board = board.step(self.calc_index_of_tile_on_the_left(&board).unwrap());
        board = board.step(self.calc_index_of_tile_below(&board).unwrap());
        board = board.step(self.calc_index_of_tile_on_the_right(&board).unwrap());
        board = board.step(self.calc_index_of_tile_above(&board).unwrap());
        board = board.step(self.calc_index_of_tile_on_the_left(&board).unwrap());
        board = board.step(self.calc_index_of_tile_below(&board).unwrap());
        return board;
    }

    fn calc_index_of_tile_above(&self, board: &Board) -> Option<TileIndex> {
        let blank_tile_index = board.get_blank_tile_index();
        if blank_tile_index < 4 {
            return None;
        }

        return Some(blank_tile_index - 4);
    }

    fn calc_index_of_tile_on_the_left(&self, board: &Board) -> Option<TileIndex> {
        let blank_tile_index = board.get_blank_tile_index();
        if blank_tile_index < 1 {
            return None;
        }

        return Some(blank_tile_index - 1);
    }

    fn calc_index_of_tile_below(&self, board: &Board) -> Option<TileIndex> {
        let blank_tile_index = board.get_blank_tile_index();
        if blank_tile_index > 11 {
            return None;
        }

        return Some(blank_tile_index + 4);
    }

    fn calc_index_of_tile_on_the_right(&self, board: &Board) -> Option<TileIndex> {
        let blank_tile_index = board.get_blank_tile_index();
        if blank_tile_index > 14 {
            return None;
        }

        return Some(blank_tile_index + 1);
    }
}

trait SolveStrategy {
    fn check_solved(&self, board: &Board) -> bool;

    fn calc_heuristic(&self, board: &Board) -> i32 {
        // It looks like vectors do not memorize its length. So the len() takes up quite a bit of time.
        // But we need to include the path length to the heuristic because it optimizes the step count.
        return -self.calc_manhattan_distance(board) - (board.path.len() as i32);
    }

    fn calc_manhattan_distance(&self, board: &Board) -> i32;

    fn near(&self, index1: TileIndex, index2: TileIndex) -> bool {
        let col1 = self.calc_col(index1) as i32;
        let row1 = self.calc_row(index1) as i32;

        let col2 = self.calc_col(index2) as i32;
        let row2 = self.calc_row(index2) as i32;

        return (col1 - col2).abs() == 1 && row1 == row2
            || (row1 - row2).abs() == 1 && col1 == col2;
    }

    fn calc_col(&self, index: TileIndex) -> TileIndex {
        return ((index as f32) / 4.0).floor() as TileIndex;
    }

    fn calc_row(&self, index: TileIndex) -> TileIndex {
        return index % 4;
    }
}

struct PositionOneTile {
    tile: Tile,
    dest_index: TileIndex,
}

impl SolveStrategy for PositionOneTile {
    fn check_solved(&self, board: &Board) -> bool {
        return board.state[self.dest_index] == self.tile;
    }

    fn calc_manhattan_distance(&self, board: &Board) -> i32 {
        let blank_tile_index = board.get_blank_tile_index();
        let index = board.state.iter().position(|&x| x == self.tile).unwrap();

        let cur_col = self.calc_col(index) as i32;
        let cur_row = self.calc_row(index) as i32;

        let dest_col: i32;
        let dest_row: i32;
        if self.near(index, blank_tile_index) || self.tile == BLANK_TILE {
            dest_col = self.calc_col(self.dest_index) as i32;
            dest_row = self.calc_row(self.dest_index) as i32;
        } else {
            dest_col = self.calc_col(blank_tile_index) as i32;
            dest_row = self.calc_row(blank_tile_index) as i32;
        }

        return (cur_col - dest_col).abs() + (cur_row - dest_row).abs();
    }
}

struct PositionManyTiles {
    tiles: Vec<Tile>,
    dest_indexes: Vec<TileIndex>,
}

impl SolveStrategy for PositionManyTiles {
    fn check_solved(&self, board: &Board) -> bool {
        for (tile, dest_index) in self.tiles.iter().zip(self.dest_indexes.iter()) {
            if *tile != board.state[*dest_index] {
                return false;
            }
        }
        return true;
    }

    fn calc_manhattan_distance(&self, board: &Board) -> i32 {
        let mut distance: i32 = 0;

        for (tile, dest_index) in self.tiles.iter().zip(self.dest_indexes.iter()) {
            let index = board.state.iter().position(|&x| x == *tile).unwrap();

            let cur_col = self.calc_col(index) as i32;
            let cur_row = self.calc_row(index) as i32;

            let dest_col = self.calc_col(*dest_index) as i32;
            let dest_row = self.calc_row(*dest_index) as i32;

            distance += (cur_col - dest_col).abs() + (cur_row - dest_row).abs();
        }

        return distance;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_check_that_a_tile_can_be_moved() {
        let b1 = Board {
            state: [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15",
                "0",
            ],
            path: vec![],
        };
        assert_eq!(b1.check_step(0), false);
        assert_eq!(b1.check_step(10), false);
        assert_eq!(b1.check_step(100), false);

        let b2 = Board {
            state: [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "0", "11", "12", "13", "14",
                "15",
            ],
            path: vec![],
        };
        assert_eq!(b2.check_step(6), true);
        assert_eq!(b2.check_step(9), true);
        assert_eq!(b2.check_step(11), true);
        assert_eq!(b2.check_step(14), true);
    }

    #[test]
    fn should_replace_a_tile_with_the_blank_one() {
        let b1 = Board {
            state: SOLVED_BOARD_STATE.clone(),
            path: vec![],
        };
        assert_eq!(
            b1.step(11).state,
            [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "0", "13", "14", "15",
                "12"
            ]
        );
        assert_eq!(
            b1.step(14).state,
            [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "0",
                "15"
            ]
        );

        let b2 = Board {
            state: [
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14",
                "15",
            ],
            path: vec![],
        };
        assert_eq!(
            b2.step(4).state,
            [
                "4", "1", "2", "3", "0", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14",
                "15"
            ]
        );
        assert_eq!(
            b2.step(1).state,
            [
                "1", "0", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14",
                "15"
            ]
        );
    }

    #[test]
    fn should_remember_moved_tiles_in_a_right_order() {
        let b1 = Board {
            state: SOLVED_BOARD_STATE.clone(),
            path: vec![],
        };
        assert_eq!(
            b1.step(14).step(10).step(9).step(13).step(14).path,
            vec![14, 10, 9, 13, 14],
        );
    }

    #[test]
    fn should_identify_unsolvable_boards() {
        assert_eq!(
            Board {
                state: [
                    "3", "13", "5", "15", "9", "6", "8", "0", "10", "7", "1", "14", "12", "2",
                    "11", "4"
                ],
                path: vec![],
            }
            .check_solvable(),
            false,
        );
        assert_eq!(
            Board {
                state: [
                    "1", "13", "2", "9", "8", "0", "15", "7", "3", "10", "11", "14", "5", "6", "4",
                    "12"
                ],
                path: vec![],
            }
            .check_solvable(),
            false,
        );
        assert_eq!(
            Board {
                state: [
                    "6", "1", "9", "10", "3", "4", "14", "7", "12", "15", "2", "11", "0", "13",
                    "8", "5"
                ],
                path: vec![],
            }
            .check_solvable(),
            true,
        );
    }

    #[test]
    fn should_return_a_solvable_board() {
        let mut board = Board {
            state: SOLVED_BOARD_STATE.clone(),
            path: vec![],
        };
        assert!(board.shuffle().check_solvable());
    }

    #[test]
    fn should_find_a_way_to_get_the_solved_board() {
        let mut board = Board {
            state: [
                "6", "1", "9", "10", "3", "4", "14", "7", "12", "15", "2", "11", "0", "13", "8",
                "5",
            ],
            path: vec![],
        };
        let mut autosolver = Autosolver::new();
        let path = autosolver.execute(board.state.clone());

        for tile in path {
            board = board.step(tile);
        }
        assert_eq!(board.state, SOLVED_BOARD_STATE);
    }

    #[test]
    fn should_return_an_empty_path_if_the_board_is_solved_in_the_first_place() {
        let board = Board {
            state: SOLVED_BOARD_STATE.clone(),
            path: vec![],
        };
        let mut autosolver = Autosolver::new();
        let path = autosolver.execute(board.state.clone());
        assert_eq!(path.len(), 0);
    }
}
