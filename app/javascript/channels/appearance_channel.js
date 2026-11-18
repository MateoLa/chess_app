import consumer from "channels/consumer";

let subscribed = false;
let resetFunc;
let timer = 0;

consumer.subscriptions.create({ channel: "AppearanceChannel" }, {
    initialized() {},
    connected() {
        // Called when the subscription is ready for use on the server
//        subscribed = true;
        resetFunc = () => this.resetTimer(this.uninstall);
        this.install();
        window.addEventListener("turbo:load", () => this.resetTimer());
        console.log("Appearance Channel Connected");
    },

    disconnected() {
//        subscribed = false;
        this.uninstall();
        console.log("Appearance Channel Disconnected");
    },
    rejected() {
//        subscribed = false;
        this.uninstall();
        console.log("Rejected");
    },
    received(data) {
        // Called when there's incoming data on the websocket for this channel
    },
    online() {
//        if (subscribed) { 
            this.perform("online"); //}
        console.log("online");
    },
    away() {
//        if (subscribed) { 
this.perform("away"); //}
        console.log("away");
    },
    offline() {
//        if (subscribed) { 
this.perform("offline"); //}
        console.log("offline");
    },
    uninstall() {
        const shouldRun = document.getElementById("appearance_channel");
        if (!shouldRun && subscribed) {
            clearTimeout(timer);
            this.perform("offline");
        }
    },
    install() {
        window.removeEventListener("load", resetFunc);
        window.removeEventListener("DOMContentLoaded", resetFunc);
        window.removeEventListener("click", resetFunc);
        window.removeEventListener("keydown", resetFunc);

        window.addEventListener("load", resetFunc);
        window.addEventListener("DOMContentLoaded", resetFunc);
        window.addEventListener("click", resetFunc);
        window.addEventListener("keydown", resetFunc);
        this.resetTimer();
        console.log("Install");
    },
    resetTimer() {
        this.uninstall();
        const shouldRun = document.getElementById("appearance_channel");

        if (!!shouldRun) {
            this.online();
            clearTimeout(timer);

            // Number of minutes to be delayed
            const timeInMinutes = 5;
            const milliseconds = timeInMinutes * 60 * 1000;

            timer = setTimeout(this.away.bind(this), milliseconds);
        }
    },
});
