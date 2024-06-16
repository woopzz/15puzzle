use rand::thread_rng;
use rand::seq::SliceRandom;

type Tiles = [char; 16];
type TileIndex = usize;

const BLANK_TILE: char = 'F';
const SOLVED_BOARD_STATE: Tiles = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

struct Board {
    state: Tiles,
    path: Vec<TileIndex>,
}

impl Board {

    fn check_step(&self, tile_index: TileIndex) -> bool {
        if tile_index < 0 || tile_index > 15 {
            return false;
        }

        let blank_tile_index = self.get_blank_tile_index();
        return
            (tile_index >= 4 && tile_index - 4 == blank_tile_index) ||
            (tile_index + 4 == blank_tile_index) ||
            (tile_index >= 1 && tile_index - 1 == blank_tile_index && tile_index % 4 != 0) ||
            (tile_index + 1 == blank_tile_index && tile_index % 4 != 3);
    }

    fn step(&self, tile_index: TileIndex) -> Board {
        let mut state = self.state.clone();
        let blank_tile_index = self.get_blank_tile_index();
        state[blank_tile_index] = state[tile_index];
        state[tile_index] = BLANK_TILE;

        let mut path = self.path.clone();
        path.push(tile_index);

        return Board { state, path };
    }

    fn shuffle(&self) -> Board {
        let mut board = Board { state: self.state.clone(), path: vec![] };
        let mut rng = thread_rng();
        loop {
            board.state.shuffle(&mut rng);
            if board.check_solvable() && !board.check_solved() {
                return board;
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

    fn check_solved(&self) -> bool {
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
            for j in (i+1)..length {
                if
                    self.state[i] != BLANK_TILE
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn should_check_that_a_tile_can_be_moved() {
        let b1 = Board {
            state: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
            path: vec![],
        };
        assert_eq!(b1.check_step(0), false);
        assert_eq!(b1.check_step(10), false);
        assert_eq!(b1.check_step(100), false);

        // 0 1 2 3
        // 4 5 6 7
        // 8 9 F A
        // C D E B
        let b2 = Board {
            state: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'F', 'A', 'C', 'D', 'E', 'B'],
            path: vec![],
        };
        assert_eq!(b2.check_step(6), true);
        assert_eq!(b2.check_step(9), true);
        assert_eq!(b2.check_step(11), true);
        assert_eq!(b2.check_step(14), true);
    }

    #[test]
    fn should_replace_a_tile_with_the_blank_one() {
        let b3 = Board {
            state: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
            path: vec![],
        };
        assert_eq!(b3.step(11).state, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'F', 'C', 'D', 'E', 'B']);
        assert_eq!(b3.step(14).state, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'F', 'E']);

        let b4 = Board {
            state: ['F', '1', '2', '3', '0', '5', '6', '7', '4', '9', 'A', 'B', '8', 'C', 'D', 'E'],
            path: vec![],
        };
        assert_eq!(b4.step(4).state, ['0', '1', '2', '3', 'F', '5', '6', '7', '4', '9', 'A', 'B', '8', 'C', 'D', 'E']);
        assert_eq!(b4.step(1).state, ['1', 'F', '2', '3', '0', '5', '6', '7', '4', '9', 'A', 'B', '8', 'C', 'D', 'E']);
    }

    #[test]
    fn should_remember_moved_tiles_in_a_right_order() {
        let b5 = Board {
            state: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
            path: vec![],
        };
        assert_eq!(
            b5.step(14).step(10).step(9).step(13).step(14).path,
            vec![14, 10, 9, 13, 14],
        );
    }

    #[test]
    fn should_identify_unsolvable_boards() {
        assert_eq!(
            Board {
                state: ['2', 'C', '4', 'E', '8', '5', '7', 'F', '9', '6', '0', 'D', 'B', '1', 'A', '3'],
                path: vec![],
            }.check_solvable(),
            false,
        );
        assert_eq!(
            Board {
                state: ['0', 'C', '1', '8', '7', 'F', 'E', '6', '2', '9', 'A', 'D', '4', '5', '3', 'B'],
                path: vec![],
            }.check_solvable(),
            false,
        );
        assert_eq!(
            Board {
                state: ['5', '0','8', '9', '2', '3', 'D', '6', 'B', 'E', '1', 'A', 'F', 'C', '7', '4'],
                path: vec![],
            }.check_solvable(),
            true,
        );
    }

    #[test]
    fn should_return_a_solvable_board() {
        let board = Board {
            state: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
            path: vec![],
        };
        assert!(board.shuffle().check_solvable());
    }

}
