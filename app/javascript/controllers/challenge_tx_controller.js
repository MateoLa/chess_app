import { Controller } from "@hotwired/stimulus"
import consumer from "channels/consumer";
import { Turbo } from "@hotwired/turbo-rails"


export default class extends Controller {
    static targets = ["mode", "variant", "spinner", "message", "expire"];

    connect() {
        this.subscription = this.cable();
        console.log("Challenge Tx Controller Connected");
//        console.log(consumer.subscriptions.subscriptions.map(sub => sub.identifier));
    };

    cable() {
        return consumer.subscriptions.create({ 
            channel: "ChallengeChannel", 
            role: "tx" 
        }, {
            connected: () => {
                // Called when the subscription is ready to use on the server
                console.log("Challenge Channel Connected");
            },
            disconnected: () => {
                // Called when the subscription has been terminated by the server
                this.resetState();
                console.log("Challenge Channel Disconnected");
            },
            // Called when there's incoming data on the websocket for this channel
            received: (data) => this.handleCableResponse(data)
        });
    }

    challenge(e) {
        e.preventDefault();
        this.player = JSON.parse(e.currentTarget.dataset.player);
        this.messageTarget.textContent = this.translate("waiting", this.player.username);
        this.timer = 60;
        this.countdown();
        this.spinnerTarget.classList.remove("d-none");
        this.subscription.perform("challenge", {
            player: this.player.id,
            mode: this.modeTarget.value,
            variant: this.variantTarget.value
		});
    };

    handleCableResponse(data) {
        this.resetState();
        if (data.event === "accepted") {
            const url = `games/${data.game_id}/play`;
            Turbo.visit(url)
        } 
        if (data.event === "rejected") { alert(this.translate("rejected")) }
    }

    resetState() {
        this.pendingUrl = null;
        clearInterval(this.counter);
        this.timer = null;
        this.spinnerTarget.classList.add("d-none");    
    }


    disconnect() {
        this.subscription?.unsubscribe();
    }

    
///////////////  Timer Functions
    countdown() {
        this.expireTarget.textContent = this.formatTimer();
    	this.counter = setInterval(() => {
            this.timer--;
    		if (this.timer <= 0) { this.timeout(); }
            this.expireTarget.textContent = this.formatTimer();
        }, 1000);
	}

	timeout() {
        this.resetState();
        const message = this.translate("timeout", this.player.username);
        alert(message);
	}


/////////////////  Other Functions
	formatTimer() {
		let min = Math.floor(this.timer / 60);
      	let sec = this.timer - min * 60;
		return ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
  	}

	translate(key, value) {
    	const locale = "es";    // ToDo (dynamic locale change)

    	const translations = {
    		"en": {
        		"pairing": "Pairing ...",
                "rejected": "The opponent rejects the challenge",
                "timeout": `No response from ${value}`,
        		"waiting": `Waiting for ${value}`
    		},
    		"es": {
        		"pairing": "Emparejando ...",
                "rejected": "El contrincante rechazó el desafío",
                "timeout": `${value} no responde`,
        		"waiting": `Esperando por ${value}`
    		},
    	};

	    return translations[locale][key];
	}
}