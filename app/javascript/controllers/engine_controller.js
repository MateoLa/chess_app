import { Controller } from "@hotwired/stimulus";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";
import { sf } from "sf18-worker";


// Connects to data-controller="engine"
export default class extends Controller {
    static targets = ["evaluation"];

    connect() {
        console.log("Engine Controller Connected");
	    this.pieceTheme = JSON.parse(this.element.dataset.pieceTheme);
        this.wasm_digest = this.element.dataset.wasm_disgest;

     	this.game = this.engineGame();

	    document.getElementById("game_level").addEventListener("change", function() {
  	        this.game.setSkillLevel(this.value);
  	    });

        this.newGame();
    }

    newGame = () => {
        var baseTime = parseFloat($('#timeBase').val()) * 60;
        var inc = parseFloat($('#timeInc').val());
        var skill = parseInt($("#game_skill_level").val());
        this.game.reset();
        this.game.setTime(baseTime, inc);
        this.game.setSkillLevel(skill);
        this.game.setPlayerColor($("#game_color_black").is(':checked') ? 'black' : 'white');
        this.game.setDisplayScore($('#game_score').is(':checked'));
        this.game.start();
    }


	engineGame(options) {
        "use strict";

        options = options || {};
        let game = new Chess();
        let board;
        let isPromotion = false;

//	    let wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
//	    let engine = new Worker(wasmSupported ? '/stockfish/sf171-79.wasm' : '/stockfish/sf171-79.js');
//	    let evaler = new Worker(wasmSupported ? '/stockfish/sf171-79.wasm' : '/stockfish/sf171-79.js');

        const engine = new Worker(sf, { type: 'module' });
        engine.onerror = (event) => { console.warn("MaLa engine error: ", event); };
        engine.postMessage({ type: 'INIT_WASM', wasm_digest: this.wasm_digest });


        const evaler = new Worker(sf, { type: 'module' });
        evaler.onerror = (event) => { console.warn("MaLa evaler error: ", event); };
        evaler.postMessage({ type: 'INIT_WASM', wasm_digest: this.wasm_digest });


        let engineStatus = {};
        var displayScore = false;
        var time = { wtime: 300000, btime: 300000, winc: 2000, binc: 2000 };
        var playerColor = 'white';
        var clockTimeoutID = null;
        var isEngineRunning = false;
        var evaluation = this.evaluationTarget;
        var announced_game_over;

        var onDragStart = function(piece) {
            // do not pick up pieces if the game is over
            if (game.isGameOver()) return false;
    
            // or if it's not that side's turn
            var turn = game.turn() == 'w' ? 'white' : 'black';
            if (turn !== playerColor) { return false; }
    
            // only pick up pieces for the side to move
            var waits = game.turn() == 'w' ? /^b/ : /^w/
            if (piece.search(waits) !== -1) return false;
        };

        setInterval(function () {
            if (announced_game_over) return;        
            if (game.isGameOver()) { announced_game }
        }, 1000);

        function uciCmd(cmd, which) {
            console.log("UCI: " + cmd);
        
            (which || engine).postMessage({type: 'CMD', cmd: cmd});
        }

	uciCmd('uci');
    
    function displayStatus() {
      var status = 'Engine: ';
      if (!engineStatus.engineLoaded) {
        status += 'loading...';
      } else if(!engineStatus.engineReady) {
        status += 'loaded...';
      } else {
        status += 'ready.';
      }
        
      if (engineStatus.search) {
        status += '<br>' + engineStatus.search;
    	  if (engineStatus.score && displayScore) {
      	  status += (engineStatus.score.substr(0, 4) === "Mate" ? " " : ' Score: ') + engineStatus.score;
      	}
    	}
      $('#engineStatus').html(status);
    }

    function displayClock(color, t) {
        var isRunning = false;
        if (time.startTime > 0 && color == time.clockColor) {
            t = Math.max(0, t + time.startTime - Date.now());
            isRunning = true;
        }
        var id = color == playerColor ? '#time2' : '#time1';
        var sec = Math.ceil(t / 1000);
        var min = Math.floor(sec / 60);
        sec -= min * 60;
        var hours = Math.floor(min / 60);
        min -= hours * 60;
        var display = hours + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
        if (isRunning) {
            display += sec & 1 ? ' <--' : ' <-';
        }
        $(id).text(display);
    }

    function updateClock() {
        displayClock('white', time.wtime);
        displayClock('black', time.btime);
    }

    function clockTick() {
        updateClock();
        var t = (time.clockColor == 'white' ? time.wtime : time.btime) + time.startTime - Date.now();
        var timeToNextSecond = (t % 1000) + 1;
        clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
    }

    function stopClock() {
        if(clockTimeoutID !== null) {
            clearTimeout(clockTimeoutID);
            clockTimeoutID = null;
        }
        if (time.startTime > 0) {
            var elapsed = Date.now() - time.startTime;
            time.startTime = null;
            if (time.clockColor == 'white') {
                time.wtime = Math.max(0, time.wtime - elapsed);
            } else {
                time.btime = Math.max(0, time.btime - elapsed);
            }
        }
    }

    function startClock() {
        if (game.turn() == 'w') {
            time.wtime += time.winc;
            time.clockColor = 'white';
        } else {
            time.btime += time.binc;
            time.clockColor = 'black';
        }
        time.startTime = Date.now();
        clockTick();
    }
    
    function get_moves() {
        var moves = '';
        var history = game.history({verbose: true});

        for (let move of history) {
            moves += ' ' + move.from + move.to + (move.promotion ? move.promotion : '');
        }
        return moves;
    }

    function prepareMove() {
        stopClock();
        $('#pgn').text(game.pgn());
        board.position(game.fen());
        updateClock();
        var turn = game.turn() == 'w' ? 'white' : 'black';
        
        if (game.isGameOver()) return

        if (turn != playerColor) {
            uciCmd('position startpos moves' + get_moves());
            uciCmd('position startpos moves' + get_moves(), evaler);
            evaluation.textContent = "";
            uciCmd("eval", evaler);
                
            if (time && time.wtime) {
                uciCmd("go " + (time.depth ? "depth " + time.depth : "") + " wtime " + time.wtime + " winc " + time.winc + " btime " + time.btime + " binc " + time.binc);
            } else {
                uciCmd("go " + (time.depth ? "depth " + time.depth : ""));
            }
            isEngineRunning = true;
        }
        if(game.history().length >= 2 && !time.depth && !time.nodes) {
            startClock();
        }
    }

    evaler.onmessage = function(event) {
        var line;
        
        if (event && typeof event === "object") { line = event.data; } else { line = event; }  
        console.log("evaler: " + line);
        
        /// Ignore some output.
        if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
            return;
        }
        
        if (evaluation.textContent) { evaluation.textContent += "\n"; }
        evaluation.textContent += line;
    }

    engine.onmessage = function(event) {
      var line;

      if (event && typeof event === "object") { line = event.data; } else { line = event; }
      console.log("Reply: " + line)

      if (line == 'uciok') { engineStatus.engineLoaded = true;
      } else if (line == 'readyok') { engineStatus.engineReady = true;
      } else {
        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/);
        /// Did the AI move?
        if (match) {
          isEngineRunning = false;
          game.move({from: match[1], to: match[2], promotion: match[3]});
          prepareMove();
          uciCmd("eval", evaler)
          evaluation.textContent = "";
          //uciCmd("eval");
          /// Is it sending feedback?
        } else if (match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
          engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
        }
            
        /// Is it sending feed back with a score?
        if (match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
          var score = parseInt(match[2]) * (game.turn() == 'w' ? 1 : -1);
          /// Is it measuring in centipawns?
          if (match[1] == 'cp') {
            engineStatus.score = (score / 100.0).toFixed(2);
          /// Did it find a mate?
          } else if (match[1] == 'mate') {
            engineStatus.score = 'Mate in ' + Math.abs(score);
          }
                
          /// Is the score bounded?
          if (match = line.match(/\b(upper|lower)bound\b/)) {
            engineStatus.score = ((match[1] == 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score
          }
        }
      }
      displayStatus();
    };

    var onDrop = function(source, target) {
      isPromotion = false;

      // see if the move is legal
      var move = game.move({
        from: source,
        to: target,
        promotion: "q"
      });

      // illegal move
      if (move === undefined) return 'snapback';
      
      if (move.promotion && !$("#auth-promotion").is(':checked')) {
        isPromotion = true;
        promptForPromotion(source, target);
      }
    };

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    var onSnapEnd = function() {
      if (isPromotion) return
      prepareMove();
      board.position(game.fen());
    };


    var cfg = {
      showErrors: true,
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: (piece) => this.pieceTheme[piece],
    };

    board = new Chessboard("board", cfg);

    return {
        reset: function() {
            game.reset();
//          game.load("7k/4P3/8/8/8/8/8/7K w - - 0 1");
            uciCmd('setoption name Contempt value 0');
            //uciCmd('setoption name Skill Level value 20');
            this.setSkillLevel(0);
            uciCmd('setoption name King Safety value 0'); /// Agressive 100 (it's now symetric)
        },

        loadPgn: function(pgn) { game.loadPgn(pgn); },

        setPlayerColor: function(color) {
            playerColor = color;
            board.orientation(playerColor);
        },

        setSkillLevel: function(level) {
            var skill;
            switch (level) {
                case 'beginner':
                    skill = 5;
                    break;
                case 'intermediate':
                    skill = 10;
                    break;
                case 'advanced':
                    skill = 15;
                    break;                    
                default:
                    skill = 5;
            }

            var max_err, err_prob, difficulty_slider;
            
            if (skill < 0) skill = 0;
            if (skill > 20) skill = 20;
            time.level = skill;
            
            /// Change thinking depth allowance.
            if (skill < 5) { time.depth = "1";
            } else if (skill < 10) { time.depth = "2";
            } else if (skill < 15) { time.depth = "3";
            } else { time.depth = ""; }  /// time.depth = "" let the engine decide. 

            uciCmd('setoption name Skill Level value ' + skill);
            
            ///NOTE: Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
            /// Level 0 starts at 1
            err_prob = Math.round((skill * 6.35) + 1);
            /// Level 0 starts at 10
            max_err = Math.round((skill * -0.5) + 10);
            
            uciCmd('setoption name Skill Level Maximum Error value ' + max_err);
            uciCmd('setoption name Skill Level Probability value ' + err_prob);
        },

        setTime: function(baseTime, inc) {
            time = { wtime: baseTime * 1000, btime: baseTime * 1000, winc: inc * 1000, binc: inc * 1000 };
        },

        setDepth: function(depth) { time = { depth: depth }; },
      
        setNodes: function(nodes) { time = { nodes: nodes }; },
      
        setContempt: function(contempt) { uciCmd('setoption name Contempt value ' + contempt); },
      
        setAggressiveness: function(value) { uciCmd('setoption name Aggressiveness value ' + value); },
      
        setDisplayScore: function(flag) { 
			displayScore = flag;
            displayStatus();
        },

        start: function() {
            uciCmd('ucinewgame');
            uciCmd('isready');
            engineStatus.engineReady = false;
            engineStatus.search = null;
            displayStatus();
            prepareMove();
            announced_game_over = false;
        },
      
        undo: function() {
            if (isEngineRunning) return false;
            game.undo();
            game.undo();
            engineStatus.search = null;
            displayStatus();
            prepareMove();
            return true;
        }
    };

/////////////////  Promotion

  	function promptForPromotion(source, target) {
//    	let square = $(`#board [data-square=${target}]`)[0];
    	let square = document.querySelector(`#board [data-square=${target}]`);
		this.promotionView(square)

		let promotion = document.getElementById("promotion");
		promotion.style.display = "block";

		return new Promise(resolve => {
			this.promotionPieceTargets.forEach(image => {
				image.addEventListener("click", (event) => {
					promotion.style.display = "none";
					resolve(event.currentTarget.dataset.piece);
				});
			});
		});	
	}

	function promotionView(square) {
		const rect = square.getBoundingClientRect();
		const left = square.offsetLeft;

		// set images
    	for (let image of this.promotionPieceTargets) {
			image.src = this.pieceTheme[this.game.turn() + image.dataset.piece.toUpperCase()];
			image.style.width = rect.width + "px";
			image.style.height = rect.height + "px";
		}
		let promotion = document.getElementById("promotion");
	    const styles = {
			position: "absolute",
        	left: left + 1.5 * rect.width + "px",
			top: -2 * rect.height + "px"
    	};
    	Object.assign(promotion.style, styles);
	}

};
	
/*
if (typeof module !== "undefined" && module.exports) {
    module.exports = engineGame;
}

export { engineGame };
*/

}