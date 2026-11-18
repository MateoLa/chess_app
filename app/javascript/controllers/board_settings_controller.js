import { Controller } from "@hotwired/stimulus";
import { Chess } from "chess.js";
import Chessboard from "chessboardjs";

const boardThemes = {
	Chess24: ['#9E7863', '#633526'],
	Metro: ['#FFFFFF', '#EFEFEF'],
	Leipzig: ['#FFFFFF', '#E1E1E1'],
	Wikipedia: ['#FFCE9E', '#D18B47'],
	Dilena: ['#FFE5B6', '#B16228'],
	Uscf: ['#C3C6BE', '#727FA2'],
	Symbol: ['#FFFFFF', '#58AC8A'],
	Default: ['#F0D9B5', '#B58863']
};

// Connects to data-controller="board_theme"
export default class extends Controller {

    connect() {
        this.fen = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3';
        this.colors = boardThemes[this.element.dataset.boardTheme];
        this.pieceTheme = this.element.dataset.pieceTheme;
        this.pieceAssets = JSON.parse(this.element.dataset.pieceAssets);
        this.board();
        this.boardSamples();

        this.game = new Chess(this.fen);
        this.interval = setInterval(() => this.makeRandomMove(), 1500);
        console.log("Board Settings Controller Connected");
    }

    disconnect() {
        clearInterval(this.interval);
    }

    makeRandomMove() {
        let moves = this.game.moves();
        let randomId = Math.floor(Math.random() * moves.length);
        this.game.move(moves[randomId]);
        this.board.position(this.game.fen());
    }

    board() {
        const config = {
            position: this.fen,
            pieceTheme: (piece) => this.pieceAssets[this.pieceTheme][piece],
            showNotation: false
        };

        this.board = Chessboard("board", config);
        document.querySelectorAll("#board .white-1e1d7").forEach(e => e.style.background = this.colors[0]);
        document.querySelectorAll("#board .black-3c85d").forEach(e => e.style.background = this.colors[1]);
    }

    boardSamples() {
        const config = {
            position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R',
            pieceTheme: (piece) => this.pieceAssets[this.pieceTheme][piece],
            showNotation: false
        }
        Object.keys(boardThemes).forEach((theme) => {
            Chessboard("board-" + theme, config);
            let colors = boardThemes[theme];
            document.querySelectorAll(`#board-${theme} .white-1e1d7`).forEach(e => e.style.background = colors[0]);
            document.querySelectorAll(`#board-${theme} .black-3c85d`).forEach(e => e.style.background = colors[1]);
        })
    }

    setBoard(event) {
        this.colors = boardThemes[event.target.value];

        document.querySelectorAll("#board .white-1e1d7").forEach(e => e.style.background = this.colors[0]);
        document.querySelectorAll("#board .black-3c85d").forEach(e => e.style.background = this.colors[1]);

        this.sendSetting({board_theme: event.target.value});
    }

    setPieces(event) {
        let value = event.target.value;
        const config = {
            pieceTheme: (piece) => this.pieceAssets[value][piece],
            showNotation: false
        }
        this.board = Chessboard("board", config);
        document.querySelectorAll("#board .white-1e1d7").forEach(e => e.style.background = this.colors[0]);
        document.querySelectorAll("#board .black-3c85d").forEach(e => e.style.background = this.colors[1]);

        this.sendSetting({piece_theme: value})
    }

    sendSetting(params) {
        fetch("/settings.js", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({"setting": params})
        })
        .then(response => response.json()).then( data => { console.log(data.message); })
        .catch(error => { console.error('There was a problem with the fetch operation:', error); });
    }
}
