import { Controller } from "@hotwired/stimulus";
import Chessboard from "chessboardjs";
// import { Chess } from "chess.js";
// import { Pgn } from "cm-pgn"


const themes = {
	Chess24: ['#9E7863', '#633526'],
	Metro: ['#FFFFFF', '#EFEFEF'],
	Leipzig: ['#FFFFFF', '#E1E1E1'],
	Wikipedia: ['#FFCE9E', '#D18B47'],
	Dilena: ['#FFE5B6', '#B16228'],
	Uscf: ['#C3C6BE', '#727FA2'],
	Symbol: ['#FFFFFF', '#58AC8A'],
	Default: ['#F0D9B5', '#B58863']
};


// Connects to data-controller="user_board"
export default class extends Controller {

    static targets = ["annotation", "header"];

    connect() {
        console.log("Analizer Controller Connected");
        this.pieceTheme = JSON.parse(this.element.dataset.pieceTheme);
        this.colors = themes[this.element.dataset.boardTheme];
        this.loadAnalyzer();

        // Bind the resize method so 'this' remains context-locked
        this.handleResize = this.handleResize.bind(this)
        window.addEventListener("resize", this.handleResize)
    }

    loadAnalyzer() {
//    this.game = new Chess();

        const config = {
            position: "start",
            draggable: true,
            orientation: "white",
            pieceTheme: (piece) => this.pieceTheme[piece],
            showNotation: false
        };

        this.board = Chessboard("board", config);
        document.querySelectorAll("#board .white-1e1d7").forEach(e => e.style.background = this.colors[0]);
        document.querySelectorAll("#board .black-3c85d").forEach(e => e.style.background = this.colors[1]);
    }

    pgnLoad() {
        this.pgn = new Pgn(event.currentTarget.value.trim());
        this.parsePgn();
    }

    pgnUpload() {
        this.readFile(event.currentTarget);
    }

    async readFile (input) {
        const [file] = input.files;
        if (!file) return;
        let pgn = await file.text();
        this.pgn = new Pgn(pgn.trim());
        this.parsePgn();
    }

    parsePgn() {
        this.header = this.pgn.header;
        this.history = this.pgn.history;
        this.printHeader();
        this.endBtn();
    }

    fenLoad() {
        console.log("Mateo")
//      this.game.loadPgn(this.pgn);
        this.board.position(event.currentTarget.value.trim());
    }

    printHeader() {
        let aux = "";
        for (const [key, value] of Object.entries(this.header.tags)) {
            aux += `${key}: ${value}<br>`;
        }
        this.headerTarget.innerHTML = aux;
//      this.headerTarget.textContent = JSON.stringify(this.header.tags, null, " ");
    }

    endBtn() {
        this.index = this.history.moves.length - 1;
        this.board.position(this.history.moves[this.index].fen);
        this.annotate(this.index);
    };

    nextBtn() {
        this.index += 1;
        if (this.index >= this.history.moves.length) this.index = this.history.moves.length - 1;
        this.board.position(this.history.moves[this.index].fen);
        this.annotate(this.index);
    };
  
    prevBtn() {
        this.index -= 1;
        if (this.index < 0) { this.startBtn(); } 
        else {
            this.board.position(this.history.moves[this.index].fen);
            this.annotate(this.index);
        }
    };
  
    startBtn() {
        this.board.position("start");
        this.index = -1;
    };
  
    annotate(i) {
        let commentBefore = this.history.moves[i].commentBefore;
        let commentAfter = this.history.moves[i].commentAfter;
        let comment = "";
        if (commentBefore) { comment += commentBefore + " "; } 
        if (commentAfter) { comment += commentAfter; }
        this.annotationTarget.textContent = comment;
    };

    flipBtn() { this.board.flip(); }

    changeTheme() {
        this.board = Chessboard('yourBoardID', {
            pieceTheme: `[path to your themes folder]/${pieceSetup}/{piece}.png`,
            // other settings...
        });
    }

    handleResize() { this.board.resize(); }
}

