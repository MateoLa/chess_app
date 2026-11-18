import { Controller } from "@hotwired/stimulus";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";

// Connects to data-controller="notable"
export default class extends Controller {
    static targets = ["annotation"];

    connect() {
        this.pieceTheme = JSON.parse(this.element.dataset.pieceTheme);
        this.loadNotable();
        this.startBtn();
        this.makeMove();

        // Bind the resize method so 'this' remains context-locked
        this.handleResize = this.handleResize.bind(this)
        window.addEventListener("resize", this.handleResize)
        console.log("Notable Controller Connected");
    }

    loadNotable() {
        this.game = new Chess();
        this.game.loadPgn(this.element.dataset.pgn);
        this.history = this.game.history();
        this.comments = this.game.getComments();

        const config = {
            draggable: true,
            position: this.game.fen(),
            orientation: "white",
            pieceTheme: (piece) => this.pieceTheme[piece],
            showNotation: false
        };

        this.board = Chessboard("board", config);
    }

    makeMove() {
        this.timer = setTimeout(() => this.makeMove(), 3000);
        this.nextBtn();
    }

    nextBtn() {
        if (this.index >= this.history.length) return;
        this.game.move(this.history[this.index]);
        this.board.position(this.game.fen());
        this.index += 1;
        this.annotate(this.index);
    };
  
    prevBtn() {
        this.game.undo();
        this.board.position(this.game.fen());
        this.index -= 1;
        if (this.index < 0) { this.index = 0; }
        this.annotate(this.index);
    };

    pauseBtn() {
        if (this.timer !== null) { clearTimeout(this.timeout); };
    };

    startBtn() {
        this.game.reset();
        this.board.position(this.game.fen());
        this.index = 0;
        this.annotate(this.index);
    };

    endBtn() {
        this.game.loadPgn(this.element.dataset.pgn);
        this.board.position(this.game.fen());
        this.index = this.history.length;
        this.annotate(this.index);
    };

    annotate(i) {
        this.annotationTarget.textContent = "";
        let comment = this.comments.find(obj => obj.fen === this.game.fen());
        if (comment) { this.annotationTarget.textContent = comment.comment; }
    };

    disconnect() {
        if (this.timer !== null) { clearTimeout(this.timer); };
        console.log("Notable Controller Disconnected");
    }

    handleResize() { this.board.resize(); }
}

