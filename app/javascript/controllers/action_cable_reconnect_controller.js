import { Controller } from "@hotwired/stimulus";
import consumer from "channels/consumer";


export default class extends Controller {
    static values = { userId: String }

    connect() {
        const currentId = this.userIdValue || "";

        // En la primera carga inicializamos el estado sin forzar reconexión
        if (window.lastConnectedUserId === undefined) {
            window.lastConnectedUserId = currentId;
            return
        }

        // Si cambió el usuario (login, logout o cambio de cuenta), reconectamos
        if (currentId !== window.lastConnectedUserId) {
            window.lastConnectedUserId = currentId
            this.reconnect()
        }

        console.log("Action Cable Reconnect Controller Connected");
    }

    reconnect() {
        const connection = consumer?.["connection"]
        if (!connection) return

        if (connection.isOpen()) { connection.reopen() } 
        else { connection.open() }
    }
// This controller is needed because action_cable does not update subscribed connections
// when user login.
}