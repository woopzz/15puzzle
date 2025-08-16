#!/bin/bash

set -o errexit
set -o nounset

WASM_15PUZZLE_PACKAGE_DIR=./wasm-15puzzle/pkg

# Compile the wasm-15puzzle library.
cd $WASM_15PUZZLE_PACKAGE_DIR
wasm-pack build --target web
cd -
echo "result = $?"

# Make sure we include the library package.
if [ ! -h ./node_modules/wasm-15puzzle ]; then
    cd ./node_modules
    ln -s ../$WASM_15PUZZLE_PACKAGE_DIR ./wasm-15puzzle
    cd -
fi

# Build the whole thing.
node ./esbuild/config.mjs

# Copy static files to the dist folder.
cp $WASM_15PUZZLE_PACKAGE_DIR/wasm_15puzzle_bg.wasm ./dist
