## Programmatic aspects of Chess


#### Integrating Stockfish

Stockfish is a command line protocol. You will need to write stdin commands and listen to stdout. <br>
It communicates using the Universal Chess Interface [UCI](#universal-chess-interface-uci-protocol) protocol. <br>

Compiling stockfish by running `make build ARCH=x86-64-avx2 > build.log 2>&1` generates a binary file. <br>
WASM (Web Assembly) versions of this binary are: <br>
[chess.com stockfish.js](https://github.com/nmrugg/stockfish.js) Available also in npm: stockfish <br>
[lichess.com stockfish.js](https://github.com/lichess-org/stockfish.js)

Stockfish use web assembly (web workers or also called service workers) which run in the background and in independent threads. <br>

* Web Assembly is a type of code that can be run in modern browsers which builds a virtual machine (using client resources as memory) and allows us to run compiled codes (C++, Rust, etc.) on the browser. WebAssembly is designed to complement and run alongside JavaScript, sharing functionality between the two.

Stockfish also use SharedArrayBuffer to share and limit memory usage. <br>
Both, Web Workers and SharedArrayBuffer require a secure context (https://) to function. <br>
In development you will see the error: "SharedArrayBuffer not defined" <br>
You must serve your app over https or localhost for SharedArrayBuffer to be enabled. <br>


#### Fen Fields

rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
piece-positions    turn    castling-rights    en-passant-target    half-move-clock-since-pawn-advance-or-capture    full-moves


#### Lichess Chess Games Format

```sh
[Event "Rated Bullet tournament https://lichess.org/tournament/yc1WW2Ox"]
[Site "https://lichess.org/PpwPOZMq"]
[Date "2017.04.01"]
[Round "-"]
[White "Abbot"]
[Black "Costello"]
[Result "0-1"]
[UTCDate "2017.04.01"]
[UTCTime "11:32:01"]
[WhiteElo "2100"]
[BlackElo "2000"]
[WhiteRatingDiff "-4"]
[BlackRatingDiff "+1"]
[WhiteTitle "FM"]
[ECO "B30"]
[Opening "Sicilian Defense: Old Sicilian"]
[TimeControl "300+0"]
[Termination "Time forfeit"]

1. e4 { [%eval 0.17] [%clk 0:00:30] } 1... c5 { [%eval 0.19] [%clk 0:00:30] }
2. Nf3 { [%eval 0.25] [%clk 0:00:29] } 2... Nc6 { [%eval 0.33] [%clk 0:00:30] }
3. Bc4 { [%eval -0.13] [%clk 0:00:28] } 3... e6 { [%eval -0.04] [%clk 0:00:30] }
4. c3 { [%eval -0.4] [%clk 0:00:27] } 4... b5? { [%eval 1.18] [%clk 0:00:30] }
5. Bb3?! { [%eval 0.21] [%clk 0:00:26] } 5... c4 { [%eval 0.32] [%clk 0:00:29] }
6. Bc2 { [%eval 0.2] [%clk 0:00:25] } 6... a5 { [%eval 0.6] [%clk 0:00:29] }
7. d4 { [%eval 0.29] [%clk 0:00:23] } 7... cxd3 { [%eval 0.6] [%clk 0:00:27] }
8. Qxd3 { [%eval 0.12] [%clk 0:00:22] } 8... Nf6 { [%eval 0.52] [%clk 0:00:26] }
9. e5 { [%eval 0.39] [%clk 0:00:21] } 9... Nd5 { [%eval 0.45] [%clk 0:00:25] }
10. Bg5?! { [%eval -0.44] [%clk 0:00:18] } 10... Qc7 { [%eval -0.12] [%clk 0:00:23] }
11. Nbd2?? { [%eval -3.15] [%clk 0:00:14] } 11... h6 { [%eval -2.99] [%clk 0:00:23] }
12. Bh4 { [%eval -3.0] [%clk 0:00:11] } 12... Ba6? { [%eval -0.12] [%clk 0:00:23] }
13. b3?? { [%eval -4.14] [%clk 0:00:02] } 13... Nf4? { [%eval -2.73] [%clk 0:00:21] } 0-1
```


#### Lichess Puzzles Format

Puzzles are formatted as standard CSV. 

The fields are as follows: PuzzleId, FEN, Moves, Rating, RatingDeviation, Popularity, NbPlays, Themes, GameUrl, OpeningTags

```sh
00sHx,q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17,e8d7 a2e6 d7d8 f7f8,1760,80,83,72,mate mateIn2 middlegame short,https://lichess.org/yyznGmXs/black#34,Italian_Game Italian_Game_Classical_Variation
00sJ9,r3r1k1/p4ppp/2p2n2/1p6/3P1qb1/2NQR3/PPB2PP1/R1B3K1 w - - 5 18,e3g3 e8e1 g1h2 e1c1 a1c1 f4h6 h2g1 h6c1,2671,105,87,325,advantage attraction fork middlegame sacrifice veryLong,https://lichess.org/gyFeQsOE#35,French_Defense French_Defense_Exchange_Variation
00sJb,Q1b2r1k/p2np2p/5bp1/q7/5P2/4B3/PPP3PP/2KR1B1R w - - 1 17,d1d7 a5e1 d7d1 e1e3 c1b1 e3b6,2235,76,97,64,advantage fork long,https://lichess.org/kiuvTFoE#33,Sicilian_Defense Sicilian_Defense_Dragon_Variation
00sO1,1k1r4/pp3pp1/2p1p3/4b3/P3n1P1/8/KPP2PN1/3rBR1R b - - 2 31,b8c7 e1a5 b7b6 f1d1,998,85,94,293,advantage discoveredAttack master middlegame short,https://lichess.org/vsfFkG0s/black#62,
```


#### UiversalBoardDrawer

[Universal Board Drawer](https://github.com/Hakorr/UniversalBoardDrawer) A userscript library for seamlessly adding chess move arrows to game boards on popular platforms like Chess.com, Lichess.org, and almost anywhere else.


#### Open Chess Database Standard (OCGDB)

* https://github.com/nguyenpham/ocgdb
Recomendaciones para almacenar los datos de partidas de ajedrez.