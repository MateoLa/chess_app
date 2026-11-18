import { Controller } from "@hotwired/stimulus"
import consumer from "channels/consumer";
import { Turbo } from "@hotwired/turbo-rails"


export default class extends Controller {
    static targets = ["popup", "avatar", "challenger", "gamemode", "gamevariant", "expire"];

    connect() {
        this.subscription = this.cable();
        console.log("Challenge Rx Controller Connected");
    };

    cable() {
        return consumer.subscriptions.create({ 
            channel: "ChallengeChannel", 
            role: "rx" 
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

    accept() {
        this.subscription.perform("accepted", {
            mode: this.mode,
            variant: this.variant,
            challenger: this.challenger
		});
    }

    reject() {
        this.resetState();
        this.subscription.perform("rejected", {
            challenger: this.challenger
		});
    }

    handleCableResponse(data) {
        console.log("Cable Response Data: ", data)
        this.resetState();
        if (data.event === "accepted") {
            const url = `games/${data.game_id}/play`;
            Turbo.visit(url);
        }
        if (data.event == "propagate") { 
            this.mode = data.mode;
            this.variant = data.variant;
            this.challenger = data.challenger;
            this.avatarTarget.src = data.avatar;
            this.username = data.username;
            this.challengerTarget.textContent = this.username;
            this.gamemodeTarget.textContent = data.gamemode;
            this.gamevariantTarget.textContent = data.gamevariant;
            this.timer = 60;
            this.countdown();
            this.popupTarget.classList.remove("d-none"); 
        }               
    }

    resetState() {
        clearInterval(this.counter);
        this.timer = null;
        this.popupTarget.classList.add("d-none");    
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
        const message = this.translate("timeout", this.username);
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
        		"waiting": "Waiting for ",
                "timeout": `No response from ${value}`
    		},
    		"es": {
        		"pairing": "Emparejando ...",
        		"waiting": "Esperando por ",
                "timeout": `${value} no responde.`
    		},
    	};

	    return translations[locale][key];
	}
}