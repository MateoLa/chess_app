import { Controller } from "@hotwired/stimulus";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";
import consumer from "channels/consumer";


// Connects to data-controller="chess"
export default class extends Controller {
	static targets = ["wtimer", "btimer", "promotionPiece", "state"];

	connect() {
		this.token = this.element.dataset.token;
    	this.game_id = this.element.dataset.gameId;
console.log("Game ID: ", this.game_id);
	    this.player = this.element.dataset.orientation[0];
		this.mode = this.element.dataset.mode;
		this.wtimer = parseInt(this.element.dataset.whiteTimer, 10); 
    	this.btimer = parseInt(this.element.dataset.blackTimer, 10); 
	    this.increment = parseInt(this.element.dataset.increment, 10);

		this.pieceTheme = JSON.parse(this.element.dataset.pieceTheme);
		this.subscription = this.cable();
	    this.play();

		this.counter = null;
		this.elapsedUpdate();
		this.countdown();
		console.log("Challenge Controller Connected");
	}

	elapsedUpdate() {
		const updatedAt = parseInt(this.element.dataset.updatedAt, 10)
		if (updatedAt) {
			const elapsed = Math.floor( Date.now()/1000 - updatedAt );
			this.game.turn() == "w" ?
				this.wtimer = Math.max(0, this.wtimer - elapsed) :
				this.btimer = Math.max(0, this.btimer - elapsed);
			this.updateTimer();
		}
	}

	cable() {
		return consumer.subscriptions.create({
			channel: "GameChannel",
        	token: this.token,
      	}, {
        	connected: () => {
          		// Called when the subscription is ready for use on the server
          		console.log("Game Channel Connected");
        	},
	        disconnected() {
        		// Called when the subscription has been terminated by the server
			},
        	received: (data) => {
        		// Called when there's incoming data on the websocket for this channel
console.log("Data: ", data)
				if (this.player == data.turn) {
					this.player == "w" ? 
						this.btimer = data.btimer :
						this.wtimer = data.wtimer;
					this.updateTimer();
					this.game.move(data.move);
					this.onSnapEnd();
					this.game.isGameOver() ? this.goodbye() : this.countdown();
				}
        	},
    	});
	}

	play() {
    	this.game = new Chess(this.element.dataset.fen);

	    // Need to bind this to the class
    	var config = {
    		draggable: true,
    		position: this.element.dataset.fen || "start",
    		orientation: this.element.dataset.orientation,
    		onDragStart: this.onDragStart.bind(this),
    		onDrop: this.onDrop.bind(this),
    		onMouseoutSquare: this.onMouseoutSquare.bind(this),
    		onMouseoverSquare: this.onMouseoverSquare.bind(this),
    		onSnapEnd: this.onSnapEnd.bind(this),
			pieceTheme: (piece) => this.pieceTheme[piece],
//	  sparePieces: true   --> To edit your board.
    	};

    	this.board = Chessboard("board", config);
	}

	removeGreySquares() {
		$("#board .square-55d63").css("background", "");
	}

	greySquare(square) {
		let $square = $("#board .square-" + square);
    	let whiteSquareGrey = "#a9a9a9";
    	let blackSquareGrey = "#696969";

		let background = whiteSquareGrey;
		if ($square.hasClass("black-3c85d")) {
			background = blackSquareGrey;
		}

		$square.css("background", background);
	}

	onMouseoverSquare(square, piece) {
		if (this.game.turn() !== this.player) return;

		// get list of possible moves for this square
		let moves = this.game.moves({
			square: square,
			verbose: true,
		});

		// exit if there are no moves available for this square
		if (moves.length === 0) return;

		// highlight the square they moused over
		this.greySquare(square);

		// highlight the possible squares for this piece
		for (let i = 0; i < moves.length; i++) {
			this.greySquare(moves[i].to);
		}
	}

	onMouseoutSquare(square, piece) {
    	this.removeGreySquares();
  	}

	onDragStart(source, piece) {
		// do not pick up pieces if the game is over
		if (this.game.isGameOver()) { return false; }

		// or if it's not that side's turn
		if (this.game.turn() !== this.player) { return false; }

		// only pick up pieces for the side to move
		if ((this.game.turn() == "w" && piece.search(/^b/) !== -1) ||
			(this.game.turn() == "b" && piece.search(/^w/) !== -1)) {
			return false;
		}
	}

	onDrop(source, target) {
		this.removeGreySquares();
		if (this.game.turn() !== this.player) { return "snapback"; }

		// Store the moveNumber before it could change after the move
		this.moveNumber = this.game.moveNumber();

		let move;
		if ( this.isPromotion(source, target) ) { 
	        // 1. ASYNC FLOW: Prompt the user
			this.promptForPromotion(source, target).then(response => { 
				try {
					move = this.game.move({from: source, to: target, promotion: response});
					// If chess.move succeeds but returns null (depending on strict version rules)
					if (move === null) { return 'snapback'; }
				}
				catch (error) {
					if (move == null) { return "snapback"; }
				}
	            this.finalizeMove(move);
			})
		} else { 
	        // 2. SYNC FLOW: Standard move
			try {
				move = this.game.move({from: source, to: target});
				// If chess.move succeeds but returns null (depending on strict version rules)
				if (move === null) { return 'snapback'; }
			} catch (error) {
				if (move == null) { return "snapback"; }
			}
		    this.finalizeMove(move);
		}
	}

	onSnapEnd() {
        this.board.position(this.game.fen());    // Update position for castling, en passant, pawn promotion
	}

	isPromotion(source, target) {
		const piece = this.game.get(source);

		if (piece?.type !== "p") { return false; }
		if (piece?.color !== this.game.turn()) { return false; }
		if (!["1", "8"].some((it) => target.endsWith(it))) { return false; }

		return this.game.moves({ square: source, verbose: true }).map(it => it.to).includes(target);
	}

	finalizeMove(move) {
		// The move is done and the turn has changed.
		this.player == "w" ? 
			this.wtimer += this.increment :
			this.btimer += this.increment;
		this.updateTimer();
    	this.countdown();
		this.subscription.perform("movement", {
			game_id: this.game_id,
			wtimer: this.wtimer,
			btimer: this.btimer,
			move: move,
			moveNumber: this.moveNumber,
			turn: this.game.turn()
		});

		// Check game over here, but delay the UI popup slightly 
		// so the castling/promotion animation can finish rendering first
		if (this.game.isGameOver()) {
			clearTimeout(this.counter);
			setTimeout(() => {this.goodbye(); }, 250); // 250ms is usually enough time for the snap animation

			this.subscription.perform("gameover", {
				game_id: this.game_id,
				pgn: this.game.pgn(),
				state: this.gameState()
    		});
		}
	}

	goodbye() {
		// The turn changes immediatelly after the move.
		const winner = this.game.turn() ==  "w" ? "Black" : "White";

		let state = this.gameState();
		let msg = "";
		switch(state) {
			case "checkmate":
    			msg = "Checkmate: " + winner + " wins";
    			break
  			case "draw":
				msg = "Game over: drawn position";
 				break
  			case "in_progress":
				msg = this.game.turn() + " to move";
				if (this.game.inCheck()) { msg += ", " + this.game.turn() + " is in check" }
				break
			case "timeout":
				msg = "Timeout: " + winner + " wins";
				break
		}
    	this.stateTarget.textContent = msg;
	}

	gameState() {
    	if (this.game.isCheckmate()) { return "checkmate"; }
    	if (this.game.isDraw()) { return "draw"; }
    	if (this.wtimer <= 0 || this.btimer <= 0) { return "timeout"; }
    	return "in_progress";
	}

///////////////  Challenge Timer Functions

    countdown() {
		if (this.counter) clearInterval(this.counter);

    	this.counter = setInterval(() => {
        	let time = this.game.turn() == "w" ? this.wtimer-- : this.btimer--;
    		if (time <= 0) { 
				this.timeout();
				return;
			}
            this.updateTimer();
        }, 1000);
	}

    updateTimer() {
		this.wtimerTarget.textContent = this.formatTimer(this.wtimer);
		this.btimerTarget.textContent = this.formatTimer(this.btimer);
    }

	timeout() {
		clearInterval(this.counter);
		this.counter = null;
		if (this.player == this.game.turn()) { 
			this.subscription.perform("gameover", {
				game_id: this.game_id,
				pgn: this.game.pgn(),
				state: this.gameState()
    		});
		}
		this.goodbye();
	}

/////////////////  Promotion

  	promptForPromotion(source, target) {
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

	promotionView(square) {
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

///////////////  Format Timer

	formatTimer(sec) {
		let min = Math.floor(sec / 60);
		let hrs = Math.floor(min / 60);
		let days = Math.floor(hrs / 24);
      	sec -= min * 60;
		min -= hrs * 60;
		hrs -= days * 24;
		if (days > 0 ) { return days + " " + (days == 1) ? this.translate("day") : this.translate("days") }
		else if (hrs > 0) { return ("0" + hrs).slice(-2) + ":" + ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2); }
		else { return ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2); }
  	}

	translate(key) {
    	const locale = "es";    // ToDo (dynamic locale change)

    	const translations = {
    		"en": {
        		"day": "day",
        		"days": "days"
    		},
    		"es": {
        		"day": "día",
        		"days": "días"
    		},
    	};

	    return translations[locale][key];
	}

	disconnect() {
    	clearInterval(this.counter);
        this.subscription.unsubscribe();
		console.log("Chess Controller Disconnected");
	}
}
