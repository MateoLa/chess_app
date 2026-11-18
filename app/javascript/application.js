// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import "channels";

import "popper"
import "bootstrap"

/*
if ("serviceWorker" in navigator) {
    // Register a service worker hosted at the root of the app using the default scope.
    navigator.serviceWorker.register("/service-worker.js", { scope: "/"})
    .then(registration => {
        if ("SyncManager" in window) {
            console.log("Service worker registration succeeded: ", registration);
        } else {
            console.log("This browser does not support background sync.")
        }
    })
    .catch(error => {
        console.error("Service worker registration failed: ", error);
    })
    // SyncManager provides an interface to register data offline and then sync it to the server.
    // Para que el Worker capte y responda a los eventos se necesita registrar una sincronizacion, o sea,
    // es necesario indicar al worker que datos sincronizar con el servidor.
} else {
    console.error("Service workeres are not supported");
}
*/