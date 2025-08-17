use wasm_bindgen::prelude::*;

mod solver;
use crate::solver::{Autosolver, Board, Path, SOLVED_BOARD_STATE, TILES_COUNT};

use std::cell::{Ref, RefCell};
use std::rc::Rc;

const TILE_AND_REPR: [(u8, &str); TILES_COUNT] = [
    (0, "0"),
    (1, "1"),
    (2, "2"),
    (3, "3"),
    (4, "4"),
    (5, "5"),
    (6, "6"),
    (7, "7"),
    (8, "8"),
    (9, "9"),
    (10, "10"),
    (11, "11"),
    (12, "12"),
    (13, "13"),
    (14, "14"),
    (15, "15"),
];

struct AppState {
    board: Board,
    path: Path,
}

#[wasm_bindgen(start)]
fn start() {
    console_error_panic_hook::set_once();
    let init_board = Board {
        state: SOLVED_BOARD_STATE.clone(),
        path: vec![],
    };
    let rc_app_state = Rc::new(RefCell::new(AppState {
        board: init_board,
        path: vec![],
    }));
    rc_app_state.borrow_mut().board.shuffle();
    init_cells(Rc::clone(&rc_app_state));
    init_shuffle_button(Rc::clone(&rc_app_state));
    init_autosolve_button(Rc::clone(&rc_app_state));
    repaint(rc_app_state.borrow());
}

fn get_document() -> web_sys::Document {
    let window = web_sys::window().expect("Could not access the window.");
    let document = window
        .document()
        .expect("Could not access the document of the window.");
    return document;
}

fn init_shuffle_button(rc_app_state: Rc<RefCell<AppState>>) {
    let document = get_document();

    let button_shuffle_as_element = document
        .query_selector(".shuffle")
        .expect("An error occured during searching for the shuffle button.")
        .expect("Could not find the shuffle button.");
    let button_shuffle = button_shuffle_as_element
        .dyn_ref::<web_sys::HtmlElement>()
        .expect("Could not cast the shuffle button to be `HtmlElement`.");

    let handler_button_shuffle = Closure::<dyn Fn()>::new(move || {
        rc_app_state.borrow_mut().board.shuffle();
        repaint(rc_app_state.borrow());
    });
    button_shuffle.set_onclick(Some(handler_button_shuffle.as_ref().unchecked_ref()));
    handler_button_shuffle.forget();
}

fn init_autosolve_button(rc_app_state: Rc<RefCell<AppState>>) {
    let document = get_document();

    let button_hint_as_element = document
        .query_selector(".hint")
        .expect("An error occured during searching for the hint button.")
        .expect("Could not find the hint button.");
    let button_hint = button_hint_as_element
        .dyn_ref::<web_sys::HtmlElement>()
        .expect("Could not cast the hint button to be `HtmlElement`.");

    let handler_button_hint = Closure::<dyn Fn()>::new(move || {
        let autosolver_board = rc_app_state.borrow().board.state.clone();
        let mut path = Autosolver::new().execute(autosolver_board);
        path.reverse();
        rc_app_state.borrow_mut().path = path;
        repaint(rc_app_state.borrow());
    });
    button_hint.set_onclick(Some(handler_button_hint.as_ref().unchecked_ref()));
    handler_button_hint.forget();
}

fn init_cells(rc_app_state: Rc<RefCell<AppState>>) {
    let field_as_element = get_document()
        .query_selector(".field")
        .expect("An error occured during searching for the field container.")
        .expect("Could not find the field container.");
    let field = field_as_element
        .dyn_ref::<web_sys::HtmlElement>()
        .expect("Could not cast the field container to be `HtmlElement`.");

    let handler_field = Closure::<dyn FnMut(web_sys::Event)>::new(move |ev: web_sys::Event| {
        if let Some(target) = ev.target() {
            let cell: web_sys::HtmlElement = target
                .dyn_into()
                .expect("Could not cast the event target to be `HtmlElement`.");
            if !cell.class_list().contains("box") {
                return;
            }

            let tile_repr_str = cell
                .dataset()
                .get("number")
                .expect("Could not find a tile number in dataset.");

            let mut app_state = rc_app_state.borrow_mut();

            let tari = TILE_AND_REPR
                .into_iter()
                .position(|x| x.1 == tile_repr_str)
                .expect("Could not find a tile by a tile representation.");
            let tile = TILE_AND_REPR[tari].0;

            let mb_new_board = app_state.board.move_tile(tile);
            if let Some(new_board) = mb_new_board {
                if app_state.path.len() > 0
                    && *app_state.path.last().unwrap() == *new_board.path.last().unwrap()
                {
                    app_state.path.pop();
                } else {
                    app_state.path = vec![];
                }

                app_state.board = new_board;
                drop(app_state);

                repaint(rc_app_state.borrow());
            }
        }
    });
    field.set_onclick(Some(handler_field.as_ref().unchecked_ref()));
    handler_field.forget();
}

fn repaint(app_state: Ref<'_, AppState>) {
    let cells_as_elements = get_document()
        .query_selector_all(".field > .box")
        .expect("An error occured during searching for cell buttons.");

    for i in 0..TILES_COUNT {
        if let Some(cell_as_element) = cells_as_elements.get(i as u32) {
            let cell = cell_as_element
                .dyn_ref::<web_sys::HtmlElement>()
                .expect("Could not cast a cell node to be `HtmlElement`.");

            let tile = app_state.board.state[i];
            let tari = TILE_AND_REPR
                .into_iter()
                .position(|x| x.0 == tile)
                .expect("Could not find a tile representation by a tile.");
            let tile_repr = TILE_AND_REPR[tari].1;

            cell.dataset()
                .set("number", tile_repr)
                .expect("Could not set a tile number.");
            cell.style()
                .set_property("background-color", "")
                .expect("Could not update the attr background-color.");
        }
    }

    if app_state.path.len() > 0 {
        if let Some(cell_as_element) = cells_as_elements.get(*app_state.path.last().unwrap() as u32)
        {
            let cell = cell_as_element
                .dyn_ref::<web_sys::HtmlElement>()
                .expect("Could not cast a cell node to be `HtmlElement`.");
            cell.style()
                .set_property("background-color", "#bbb")
                .expect("Could not update the attr background-color.");
        }
    }

    let won_msg_node_as_element = get_document()
        .query_selector(".won-msg")
        .expect("An error occured during searching for the 'won message' node.")
        .expect("Could not find the 'won message' node.");
    let won_msg_node = won_msg_node_as_element
        .dyn_ref::<web_sys::HtmlElement>()
        .expect("Could not cast the 'won message' node to be `HtmlElement`.");
    let display_value = match app_state.board.check_solved() {
        true => "block",
        false => "none",
    };
    won_msg_node
        .style()
        .set_property("display", display_value)
        .expect("Could not update the attr display.");
}
