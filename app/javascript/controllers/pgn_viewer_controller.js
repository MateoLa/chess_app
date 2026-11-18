import { Controller } from "@hotwired/stimulus";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";


// Connects to data-controller="user_board"
export default class extends Controller {
  static targets = ["annotation"];

  connect() {
    this.gameId = this.element.dataset.gameId;
    this.loadGame();
    this.printBoard();
    console.log("Viewer Connected");
  }

  loadGame() {
    this.game = new Chess();
    this.pgn = this.element.dataset.pgn;
    this.game.loadPgn(this.pgn);
    this.history = this.game.history();
    this.comments = this.game.getComments();
    this.index = this.history.length;
  }

  printBoard() {
    let config = {
      position: this.game.fen(),
      orientation: this.element.dataset.orientation,
      pieceTheme: this.pieceTheme.bind(this),
      showNotation: false
    }
    this.board = Chessboard("board-" + this.gameId, config);
  }

  pieceTheme(piece) {
    // wikipedia theme for white pieces
    if (piece.search(/w/) !== -1) {
      return `/assets/chesspieces/wikipedia/${piece}.png`;
    }
  
    // alpha theme for black pieces
    return `/assets/chesspieces/alpha/${piece}.png`;
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
  
  startBtn() {
    this.game.reset();
    this.board.position(this.game.fen());
    this.index = 0;
    this.annotate(this.index);
  };
  
  endBtn() {
    this.game.loadPgn(this.pgn);
    this.board.position(this.game.fen());
    this.index = this.history.length;
    this.annotate(this.index);
  };

  annotate(i) {
    this.annotationTarget.textContent = "";
    let comment = this.comments.find(obj => obj.fen === this.game.fen());
    if (comment) { this.annotationTarget.textContent = comment.comment; }
  };

  flipBtn() { this.board.flip(); }

  changeTheme() {
    this.board = Chessboard('yourBoardID', {
      pieceTheme: `[path to your themes folder]/${pieceSetup}/{piece}.png`,
      // other settings...
    });
  }

}

