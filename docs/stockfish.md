## Stockfish

Stockfish is a free, open source, and strong UCI chess engine that analyzes chess positions and computes optimal moves.

#### Description of the universal chess interface - UCI protocol

It is a command line protocol. <br>
You will need to write stdin ([UCI commands](https://backscattering.de/chess/uci/)) and listen to stdout. <br>
Compiling stockfish generates a binary file `make build ARCH=x86-64-avx2 > build.log 2>&1`

WASM (Web Assembly) versions of this binary are:
[chess.com stockfish.js](https://github.com/nmrugg/stockfish.js) Available also in npm: stockfish
[lichess.org stockfish-web](https://github.com/lichess-org/stockfish-web/releases/tag/v0.0.13)


#### WebAssembly 

Wasm is a binary instruction format for a stack-based virtual machine.

The code can be run in modern browsers to build a virtual machine which allows developers to run compiled codes (C++, Rust, etc.) on the client. 

WebAssembly is designed to complement and run alongside JavaScript, sharing functionality between them.


```sh
docker run --user $(id -u):$(id -g) --volume $(pwd):/home/builder/stockfish.js:rw niklasf/emscripten-for-stockfish
```

#### Usage

```js
var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

var stockfish = new Worker(wasmSupported ? 'stockfish.wasm.js' : 'stockfish.js');

stockfish.addEventListener('message', function (e) {
  console.log(e.data);
});

stockfish.postMessage('uci');
```

#### Changes to original Stockfish

Expose as web worker.
Web workers are inherently single threaded. Limit to one thread.
Break down main iterative deepening loop to allow interrupting search.
Limit total memory to 32 MB.
Disable Syzygy tablebases.
Disable benchmark.

#### Flavors

Stockfish.js comes in five flavors:

* The large multi-threaded engine
≈66MB and will only run in browsers with the proper CORS headers applied.
Files: stockfish-nnue-17.js & stockfish-nnue-17-part-\d.wasm
* The large single-threaded engine
Will run in browsers without CORS headers. This engine is recommended if CORS support is not possible.
Files: stockfish-nnue-17-single.js & stockfish-nnue-17-single-part-\d.wasm
* The lite mult-threaded engine
≈6MB and quite a bit weaker. This engine is recommended for mobile browsers when CORS is available.
Files: stockfish-nnue-17-lite.js & stockfish-nnue-17-lite.wasm
* The lite single-threaded engine
≈6MB and quite a bit weaker. This engine is recommended for mobile browsers that do not support CORS.
Files: stockfish-nnue-17-lite-single.js & stockfish-nnue-17-lite-single.wasm
* The ASM-JS engine
Compiled to JavaScript, not WASM. Compatible with every browser that runs JavaScript. Very slow and weak. Larger than the lite WASM engines (≈9MB). This engine should only be used as a last resort.
File: stockfish-17-asm.js

#### Test chess.com Stockfish.js

Unzip stockfis.js

cd stockfish.js (stockfish.js-master)

```sh
node examples/server.js
```

Navigate to "localhost:9091/demo"


#### Compiling Stockfish

1. Download Stockfish from its official repo (https://sotckfishchess.org/download)

2. Install Emscripten (Translates C/C++ code into Wasm and Js)

3. Compile with Emscripten:

Simply replace Makefile with Makefile.emcc and then run: <br>
`make -j build ARCH=wasm`

Or:

```sh
emcc -O3 benchmark.cpp -c -o benchmark.o
emcc -O3 bitboard.cpp -c -o bitboard.o
emcc -O3 evaluate.cpp -c -o evaluate.o
emcc -O3 main.cpp -c -o main.o
emcc -O3 misc.cpp -c -o misc.o
emcc -O3 movegen.cpp -c -o movegen.o
emcc -O3 movepick.cpp -c -o movepick.o
emcc -O3 position.cpp -c -o position.o
emcc -O3 search.cpp -c -o search.o
emcc -O3 thread.cpp -c -o thread.o
emcc -O3 timeman.cpp -c -o timeman.o
emcc -O3 tt.cpp -c -o tt.o
emcc -O3 uci.cpp -c -o uci.o
emcc -O3 ucioption.cpp -c -o ucioption.o
emcc -O3 tune.cpp -c -o tune.o

emcc -O3 syzygy/tbprobe.cpp -c -o tbprobe.o
emcc -O3 nnue/nnue_accumulator.cpp -c -o nnue_accumulator.o
emcc -O3 nnue/nnue_misc.cpp -c -o nnue_misc.o
emcc -O3 nnue/features/half_ka_v2_hm.cpp -c -o half_ka_v2_hm.o

emcc -O3 nnue/network.cpp -c -o network.o
emcc -O3 engine.cpp -c -o engine.o
emcc -O3 score.cpp -c -o score.o
emcc -O3 memory.cpp -c -o memory.o

emcc benchmark.o bitboard.o engine.o evaluate.o main.o \
memory.o misc.o movegen.o movepick.o position.o score.o \
search.o thread.o timeman.o tt.o tune.o uci.o ucioption.o \
-o stockfish.js -O3 -s EXPORT_ES6=1
```



5. Load and run Stockfish.js and Stockfish.wasm using Web Workers. 









#### [Generating Training Data](https://github.com/joergoster/Stockfish-NNUE)

Use the "no-nnue.nnue-gen-sfen-from-original-eval" binary. The given example is generation in its simplest form. There are more commands.

```sh
uci
setoption name Threads value x
setoption name Hash value y
setoption name SyzygyPath value path
isready
gensfen depth a loop b use_draw_in_training_data_generation 1 eval_limit 32000
```

Specify how many threads and how much memory you would like to use with the x and y values. The option SyzygyPath is not necessary, but if you would like to use it, you must first have Syzygy endgame tablebases on your computer, which you can find here. You will need to have a torrent client to download these tablebases, as that is probably the fastest way to obtain them. The path is the path to the folder containing those tablebases. It does not have to be surrounded in quotes.

This will save a file named "generated_kifu.bin" in the same folder as the binary. Once generation is done, rename the file to something like "1billiondepth12.bin" to remember the depth and quantity of the positions and move it to a folder named "trainingdata" in the same directory as the binaries.

* Generation Parameters

Depth is the searched depth per move, or how far the engine looks forward. This value is an integer.
Loop is the amount of positions generated. This value is also an integer