# 15 puzzle

A classic 15 puzzle game implemented as a static web app.

In addition the game, there are two extra buttons:
1. Shuffle - Shuffles the board so you don't need to reload the page.
2. Hint - Highlights the next cell you should move.

The hint feature is powered by the A* algorithm with Manhathan distance as a heuristic. Initially, the algorithm tried to solve the entire board in one go, but that was too slow. Instead, the solving process is split into stages: one or several tiles are placed in each run of A*, then locked so they can't be moved again.

There is also a special trick for placing the 3 & 4 tiles and the 7 & 8 tiles, since they are harder to position once the preceding tiles are locked.

All generated boards are guaranteed to be solvable, so the hint algorithm won't hang your computer.

### How to play

The app is hosted with Github Pages. Click the link on the repository page to play.

### Debug / Development

1. Clone the repository.
2. Install dependencies: npm, wasm-pack (requires the Rust toolchain), python3 (used to serve static files).
3. Install node modules: `npm install --save-dev`.
4. Build the app: `npm run build`.
5. Run the server: `npm run server`.
