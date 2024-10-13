# 15 puzzle

The purpose of this app is a practical implementation of the A* algorithm.
When you click the hint button, the app finds a solution using graphs and A*.

Unfortunately, it cannot calculate an optimal path (<= 80 steps).
On average there are around 112 steps (based on 100 random configurations).

### WebAssembly

Also there is a rust + webassembly version in the branch `rust`.
Despite the fact that it works, it definitely needs a bit more work.
