importScripts("https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js");


// The install event is fired when the service worker is first installed
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open("v1-0-0").then((cache) => 
            cache.addAll([    // Cache all files to serve offline.
                "/",
                "/game/vsbot.html",
                "/pages/offline.html"
            ]),
        ),
    );
});

// Fired after the install event and the service worker is actually controlling the page
// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => { 
    console.log('Service Worker active');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cache => {
                if (cache !== "v1-0-0") { return caches.delete(cache); }
            }));
        })
    );
})

// The fetch event is fired 
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response !== undefined) {
                return response;
            } else {
                return fetch(event.request).then((response) => {
                    let responseClone = response.clone();
                    caches.open("v1-0-0").then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                }).catch(() => { caches.match("/pages/offline.html") });
            }
        })
    )
});

self.addEventListener("sync", (event) => {
    if (event.tag === "sync-pref") {
        event.waitUntil(
            self.idbKeyval.getMany(["xToken", "syncPref"]).then(([token, pref]) => {
                if (pref) {
                    return fetch("/settings.js", {
                        method: "PUT",
                        headers: {
                            "X-CSRF-Token": token,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({"setting": pref})
                    }).then(response => {
                        if (response.ok) { return self.idbKeyval.del("syncPref"); }
                        else { throw new Error("Server response was not ok"); }
                    })
                }
            }).catch(error => { console.error("Sync failed: ", error); })
        )
    }
});


// Add a service worker for processing Web Push notifications:
//
// self.addEventListener("push", async (event) => {
//   const { title, options } = await event.data.json()
//   event.waitUntil(self.registration.showNotification(title, options))
// })
//
// self.addEventListener("notificationclick", function(event) {
//   event.notification.close()
//   event.waitUntil(
//     clients.matchAll({ type: "window" }).then((clientList) => {
//       for (let i = 0; i < clientList.length; i++) {
//         let client = clientList[i]
//         let clientPath = (new URL(client.url)).pathname
//
//         if (clientPath == event.notification.data.path && "focus" in client) {
//           return client.focus()
//         }
//       }
//
//       if (clients.openWindow) {
//         return clients.openWindow(event.notification.data.path)
//       }
//     })
//   )
// })
