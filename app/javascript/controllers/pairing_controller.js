import { Controller } from "@hotwired/stimulus"
import consumer from "channels/consumer";


export default class extends Controller {
    static targets = ["mode", "variant", "spinner", "expire", "game", "token", "color"];


    connect() {
        this.subscription = this.cable();
        console.log("Pairing Controller Connected");
    };

    cable() {
        return consumer.subscriptions.create("PairingChannel", {
            connected: () => {
                // Called when the subscription is ready for use on the server
                console.log("Pairing Channel Connected");
            },

            disconnected() {
                // Called when the subscription has been terminated by the server
                if (this.spinnerTarget) { this.spinnerTarget.classList.add("d-none"); }
                clearInterval(this.counter);
                console.log("Pairing Channel Disconnected");
            },

            received: (data) => {
console.log("JS Pairing Data: ", data)
                // Called when there's incoming data on the websocket for this channel
                clearInterval(this.counter);
                let url = "";
                if (data.game_id) { url = `/games/${data.game_id}/play?token=${data.token}`; }
                else { url = `/games/anonymous?token=${data.token}&mode=${data.mode}&variant_id=${data.variant}&color=${data.color}`; }
                Turbo.visit(url);
            },
        });
    }

    recruit(e) {
        e.preventDefault();
        this.timer = 60;
        this.countdown();
        this.spinnerTarget.classList.remove("d-none");
        this.subscription.send({mode: this.modeTarget.value, variant: this.variantTarget.value})
    };

    disconnect() {
        this.subscription.unsubscribe();
    }


///////////////  Spinner Timer Functions
    countdown() {
        this.expireTarget.textContent = this.formatTimer();
    	this.counter = setInterval(() => {
            this.timer--;
            this.expireTarget.textContent = this.formatTimer();
    		if (this.timer <= 0) { this.timeout(); }
        }, 1000);
	}

	timeout() {
        clearInterval(this.counter);
        this.timer = null;
        this.spinnerTarget.classList.add("d-none");
        alert("No Players OnLine");
	}

	formatTimer() {
		let min = Math.floor(this.timer / 60);
      	let sec = this.timer - min * 60;
		return ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
  	}
}
