const BLANK_TILE: char = 'F';

fn check_solvable(board: &str) -> bool {
    let empty_box_on_row_with_ddd_index = find_empty_box_row_reversed_index(board) & 1;
    let inversions_count_is_odd_number = calc_inversions_count(board) & 1;
    return (empty_box_on_row_with_ddd_index ^ inversions_count_is_odd_number) != 0;
}

fn find_empty_box_row_reversed_index(board: &str) -> u16 {
    let index = board.chars().position(|x| x == BLANK_TILE).unwrap();
    return 4 - (((index / 4) as f32).floor() as u16);
}

fn calc_inversions_count(board: &str) -> u16 {
    let mut count = 0;
    let chars: Vec<char> = board.chars().collect();
    let length = board.len();

    for i in 0..length {
        for j in (i+1)..length {
            if
                chars[i] != BLANK_TILE
                && chars[j] != BLANK_TILE
                && chars[i] > chars[j]
            {
                count += 1;
            }
        }
    }

    return count;
}

fn main() {
    println!("2C4E857F960DB1A3 solvable? {}", check_solvable(&String::from("2C4E857F960DB1A3")));
    println!("0C187FE629AD453B solvable? {}", check_solvable(&String::from("0C187FE629AD453B")));
    println!("508923D6BE1AFC74 solvable? {}", check_solvable(&String::from("508923D6BE1AFC74")));
}
