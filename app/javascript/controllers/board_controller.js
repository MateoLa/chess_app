import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";
import consumer from "channels/consumer";


export default class extends Controller {

	connect() {
		console.log("Board Controller Connected");
		this.gameId = this.element.dataset.gameId;
		this.player = this.element.dataset.orientation[0];
		this.turn = this.element.dataset.turn;
    	this.time = { 
			wtime: this.element.dataset.whiteTimer * 1000, 
			btime: this.element.dataset.blackTimer * 1000, 
			start: Math.ceil(this.element.dataset.updatedAt * 1000)
		};
		this.pieceTheme = JSON.parse(this.element.dataset.pieceTheme);

		this.printBoard();
		this.sub = this.cable();
		this.countdown();
	}

	cable() {
		return consumer.subscriptions.create({
			channel: "GameChannel",
        	game_id: this.gameId,
      	}, {
        	connected: () => {
          		// Called when the subscription is ready for use on the server
          		console.log("Game Channel Connected from Board");
        	},

	        disconnected() {
        		// Called when the subscription has been terminated by the server
			},

        	received: (data) => {
        		// Called when there's incoming data on the websocket for this channel
				if (data.timeout) {
				} else {
					this.time.btime = data.btime;
					this.time.wtime = data.wtime;
					this.turn = data.turn;
        			this.board.position(data.fen);
					this.toggleTimer();
				}
        	},
    	});
	}

	printBoard() {
		let config = {
			position: this.element.dataset.fen,
			orientation: this.element.dataset.orientation,
			pieceTheme: (piece) => this.pieceTheme[piece],
			showNotation: false
		}
		this.board = Chessboard("board-" + this.gameId, config);
	}

    countdown() {
        let elapsed = Date.now() - this.time.start;
        let time = this.turn == 'w' ?
            Math.max(0, this.time.wtime - elapsed):
            Math.max(0, this.time.btime - elapsed);
        this.updateClock(time);
    	this.timer = setTimeout(() => this.countdown(), 1000);
	}

    updateClock(time) {
        let id = this.turn == this.player ? `timer-${this.gameId}-1` : `timer-${this.gameId}-2`;
		document.getElementById(id).textContent = this.formatTimer(time);
    }

	startTimer() {
    	this.time.start = Date.now();
    	this.countdown();
	}

	toggleTimer() {
    	if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.time.start = null;
        this.turn == "w" ?
			document.getElementById("timer-" + this.gameId + "-2").textContent = this.formatTimer(this.time.btime) :
			document.getElementById("timer-" + this.gameId + "-1").textContent = this.formatTimer(this.time.wtime);
		this.startTimer();
    }

	formatTimer(time) {
		let sec = Math.ceil(time / 1000);
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
    	if (this.timer !== null) { clearTimeout(this.timer); };
		console.log("Chess Controller Disconnected");
    	console.log("Game Channel Subscription Disconnected: " + this.sub);
        consumer.subscriptions.remove(this.sub);
        this.sub = null; 
	}
}

