## Progressive Web Application

 * Service Workers

 PWAs are built using js Web Workers. They run in the browser background and in a separate thread (or threads). Among their advantages, they allow us to manage memory usage (important in RAM-intensive apps) and ensures no blocking if the worker fails. These features make them ideal for running engines like Stockfish.
 
 * Push notifications

 With push notifications, we could notify the user at any time, meaning not only when they're connected to a channel (chatting or playing a game), but also when something long-term happens (the start of a challenge, an event in a long game, etc.). <br>
 Currently we can use web-push gem, in Rails 8.1 "Extract Action Notifier" framework we will be provided.

 * Offline capabilities

 We can play against bots without an internet connection.

 * Installation prompts

 Without leaving the browser a mobile-app-like experience with better performance an device integration.

 * Runs in the background (independent threads)
 
 * Caching (Cache API)
 
 * Indexed DB Libraries

 For cache managment, like localForage, Dexie.js, idb-keyval, PouchDb and others.

 * No App Store Dependency, No OS dependency

 This makes these apps easier to find and use.

#### In this Document

[PWA Basics](#configuration)
[Offline Support](#offline-support)
[Caching Strategies](#caching-strategies)
[Push Notifications](#push-notifications)
[PWA and Stimulus](#pwa-and-stimulus)
[Offline fallback Pages](#offline-fallback-pages)
[Local Development](#local-development)

### Configuration

#### Rails structure

```ruby
app/javascript/service_worker.js  # Proxy (client side js)

app/views/pwa/
  manifest.json.erb
  service-worker.js    # Server interaction

app/controllers/pwa_controller.js
config/routes.rb
```

Manifest: Tells the browser how the app should behave when installed on a device. <br>
Service Worker: proxy between the browser and the network. <br>
Controller and Route: The js worker is sent in an independent request (fetch) so you need a route and the corresponding controller which adds the necessary headers and renders the js content.

#### Manifest file

Benefits of the Manifest<br>
The PWA can:
* Be installed on a user's home screen or desktop.
* Open in a standalone mode without the browser UI.
* Display a custom splash screen when launching.
* Maintain a consistent theme and icon across devices.

manifest.json.erb
```js
{
  "name": "PWA Demo App",
  "short_name": "PWA Demo",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [    // Multiple icons to support different devices.
    {
      "src": "/assets/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Is it possible to use pwa without a manifest file but in this case it would not be possible to install the app.

#### Service Worker

app/javascript/service-worker.js:
```js
self.addEventListener("install", (event) => { 
  console.log("Service Worker installed");
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated")
})

self.addEventListener('fetch', (event) => {
  ...
});
```

#### Register the Service Worker

app/javascript/application.js:
```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service_worker.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}
```

#### Rails 8 configs:

Gemfile:
```sh
gem 'pwa', '~> 0.1.0' # PWA helper gem --> Is needed nowadays?????
```
And you must run bundle install.

config/routes.rb:
```ruby
Rails.application.routes.draw do
  get "/manifest.json", to: "pwa#manifest", defaults: { format: :json }
  get "/service-worker.js", to: "pwa#service_worker"
end
```

Create a HomeController to handle the manifest:

```ruby
class PwaController < ApplicationController
  protect_from_forgery except: :service_worker
  skip_before_action :authenticate_user!

  def manifest
  end

  def service_worker
    respond_to do |format|
      response.headers["Service-Worker"] = "script"
      format.js { render file: Rails.root.join("app/javascript/service_worker.js"), content_type: "application/javascript" }
    end
  end

end
```

Link the Manifest in the Application Layout

app/views/layouts/application.html.erb:
```html
<head>
  <meta name="theme-color" content="#000000">  
  <%= link_tag rel: "manifest", href: pwa_manifest_path(format: :json) %>
</head>
```

#### Example: Simple Service Worker for Caching

app/javascript/service_worker.js:
```ruby
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pwa-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/some.html',
        '/styles.css',
        '/app.js',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => caches.match('/offline.html'))
  );
});
```

Or in a more complex fetch:
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response !== undefined) {
        return response
      } else {
        return fetch(event.request).then(response => {
          caches.open("pwa-cache-v1").then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        }).catch(() => caches.match('/offline.html'))
      }
    })
  );
});
```

Bunus: why you need to clone the response? [^Nt1]


### Offline Support

Service workers enable offline functionality by caching resources and intercepting network requests.

#### Define the Service Worker

app/assets/javascript/service_worker.js:
```js
const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = ["/", "/manifest.json", "/offline.html", "/assets/app.js", "/assets/app.css"];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event 
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

Register the service worker in app/javascript/application.js:
```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then((registration) => {
      console.log("ServiceWorker registration succeded: ", registration);
    }).catch((error) => {
      console.error("ServiceWorker registration failed: ", error);
    });
  });
} else {
  console.log("Service workers are not supported");
}
```

#### Background Sync when the user gets online

As an example lets see a blog post where the user post something offline and the post is published when the user gets online.

* Check for SyncManager support when you need to synch chached data to the server.

app/javascript/application.js:
```js
if ("serviceWorker" in navigator && "SyncManager" in window) { 
  ...
}
```

Blog form example:
```html
<%= form_with(url: "/blog", method: :post, id: "blogFrom") do %>
  Title
  Content
  <div>
    <%= submint_tag "Submit" %>
  </div>
<% end %>
```

You register two funcitons. One for saving data to cache when the user is offline and another for sending data to the server when the user is online.

app/javascript/application.js:
```js
# Funciton to save form data to Indexed DB via idb-keyval

const saveBlogForSync = (blog) => {
  idbKeyval set("syncBlog", blog).then(()=> {
    // Register for background sync
    return navigator.serviceWorker.ready;
  }).then(registration => registration.sync.register("sync-blog"))
  .catch(error => { console.error("Sync registration failed: ", error) })
}

# Funtion to send blog data

const sendBlog = (blog) => {
  if (navigator.onLine) {    // Send blog data immediately
    fetch("/blogs", {
      method: "POST",
      headers: {"/Content-Type": "application/json"}
      body: JSON.stringify(blog)
    })
  } else {
    saveBlogForSync(blog);
  }
}
```

See [idb-keyval usage](#idb-keyval)

app/javascript/application.js:
```js
document.getElementById("blogForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const blog = {
    title = document.getElementById("title").value;
    content = document.getElementById("content").value;
  }
  sendBlog(blog);
})
```

Instruct the service worker about what to do when the sync request comes in:

app/views/pwa/service-worker.js:
```js
importScripts("https://url/to/db-keyval.min.js");

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-blog") {
    event.waitUntil(
      self.idbKeyval.get("syncBlog").then((blog) => {    // Get the contents of what we stored erlier in the indexed DB.
        if (blog) {
          return fetch("/blogs", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(blog)
          }).then((response) => {
            if (response.ok) {
              return self.idbKeyval.del("syncBlog")    // Delete cached data to avoid sending repeated submissions every time the sync is triggered on the service worker. 
            }
            throw new Error("Network response was not ok")
          })
        }
      }).catch(error => { console.error("Sync failed: ", error) })
    )
  }
})
```

app/controllers/blogs_controller.rb
```ruby
class BlogsController < ApplicationController
    def create
        @blog = Blog.new(blog_params)
        if @blog.save
            render json: {message: "Blog created successfully"}, stuatus: :created
        else
            renser json: {message: "Failed to create blog"}, stauts: :unprocessable_content
        end
    end

    private

    def blog_params
        params.require(:blog).permit(:title, :content)
    end
end
```


### Caching Strategies

* Cache-First
Serve content from cache, fetch updates in the background
* Network-First
Always try fetching from the network, fallback to cache if offline
* Stale-While-Revalidate
Serve cache first but update it in the background

#### Implement caching strategies in the Service Worker

app/assets/javascript/service_worker.js:
```js
const ASSETS = "static-assets-v1";
const STATIC_ASSETS = ["/", "/offline.html", ...];

// Install event - Cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSETS).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - Cleanup old caches
self.addEventListener("activate", (event) => { 
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cache => {
        if (cache !== ASSETS) {
          return caches.delete(cache);
        }
      }));
    });
  );
})

// Fetch event - Implement caching strategies
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache-First (for static assets)
  if (url.origin === location.origin && ASSETS_TO_CACHE.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }

  // Network-First (for API calls)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).then(response => {
        caches.open("api-cache").then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(()=> caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate (for dynamic pages)
  event.respondWith(
    cache.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        caches.open("stale-cache").then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });

      return cachedResponse || fetchPromise;
    })
  );
});
```

Bonus: why you need to clone the response? [^Nt1]


### Push Notifications

#### Install the webpush Gem

Gemfile:
```sh
gem 'web-push'
```
And you must run bundle install.

#### Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required to authenticate your push notifications. These keys allow the push service to verify that the push request comes from your app.

In Rails Console:
```sh
vapid_key = Webpush.generate_key
vapid_key.public_key
vapid_key.private_key
```

This will output the Public Key and Private Key to the console. These keys will be used to configure your push notifications.

Set the VAPID Keys as Environment Variables. /.env:
```sh
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

If you're deploying to production set the keys as environment variables in your server

#### Configure Web Push in Rails

config/initializers/webpush.rb:
```ruby
Webpush.configure do |config|
  config.vapid_public_key = ENV["VAPID_PUBLIC_KEY"]  # Fetch the public key from environment
  config.vapid_private_key = ENV["VAPID_PRIVATE_KEY"]  # Fetch the private key from environment
  config.vapid_subject = "mailto:your-email@example.com"  # Set the contact email for VAPID
end
```

config.vapid_subject is an email address that identifies the sender for push notifications.

#### SetUp Subscription Endpoints

Create the PushSubscription Model
```ruby
rails generate model PushSubscription endpoint:string keys:text
rails db:migrate
```

app/models/push_subscription.rb:
```ruby
class PushSubscription < ApplicationRecord
  validates :endpoint, presence: true
  validates :keys, presence: true
end
```

In the backend, store push subscriptions. This handle incoming data from the frontend, which includes the endpoint URL and encryption keys.

```ruby
class PushSubscriptionsController < ApplicationController
  def create
    subscription = PushSubscription.find_or_initialize_by(endpoint: params[:endpoint])
    subscription.update!(keys: params[:keys].to_json)
    render json: { message: "Subscribed successfully" }
  end
end
```

Define the route in config/routes.rb:
```ruby
post "/push_subscriptions", to: "push_subscriptions#create"
```

Now, when a user subscribes, their subscription details will be stored in the database for future use.

#### Request User Permissions for Notifications

Add this JavaScript to prompt the user:
```js
function requestNotificationPermission() {
  if ("Notification" in window && "serviceWorker" in navigator) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notifications enabled");
      } else {
        console.log("Notifications denied");
      }
    });
  }
}
```

Call this function when the PWA loads:
```js
document.addEventListener("DOMContentLoaded", () => {
  requestNotificationPermission();
});
```

#### Subscribe Users to Push Notifications

You’ll need to handle the client-side subscription process. When a user opts in to receive push notifications, you need to subscribe them and store their subscription details (like the endpoint and keys).

On the client side, use JavaScript to request permission for push notifications and register a service worker. Once the user subscribes, send the subscription information to your Rails server to store and use for sending notifications.

app/javascript/push_notifications.js:
```js
async function subscribeUser() {
  navigator.serviceWorker.ready.then((registration) => {
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: window.vapidPublicKey
    }).then(function(subscription) {
      // Send subscription details to your server to store it
      fetch('/push_subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    });
  });
}

// Or in other version of the same function: //

async function subscribeUser() {
  window.vapidPublicKey = new Uint8Array(<%= Base64.urlsafe_decode64(ENV["VAPID_PUBLIC_KEY"]).bytes %>)
  // You could also: window.vapidPublicKey = urlBase64ToUint8Array(publicKey)
  
  // Ensure the service worker is ready
  const registration = await navigator.serviceWorker.ready;

  // Subscribe the user to push notifications
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,  // Ensures that the notifications are visible to users
    applicationServerKey: window.vapidPublicKey  // Our VAPID public key
  });

  // Send the subscription details to our server
  await fetch("/push_subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription)
  });

  console.log("User subscribed!");
}

// Run the subscription logic once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    subscribeUser();
  }
});
```


#### Send Push Notifications

Create a method to send push notifications:
```ruby
require "web-push"

def PushNotificationsController < ApplicationController
  message = {
    title: "Example",
    body: "Hello world!",
    icon: "https://example.com/icon.png"
  }

  def send_push_notification(subscription, message)
    Webpush.payload_send(
      message: message.to_json,    # The message you want to send to the user
      endpoint: subscription[:endpoint],    # The user's subscription endpoint
      p256dh: subscription[:keys][:p256dh],    # The user's public key
      auth: subscription[:keys][:auth],    # The user's auth secret
      vapid: {
        subject: "mailto:your-email@example.com",    # Your contact email
        public_key: ENV["VAPID_PUBLIC_KEY"],    # The VAPID public key
        private_key: ENV["VAPID_PRIVATE_KEY"]    # The VAPID private key
      },
      ssl_timeout: 5,    # Optional
      open_timeout: 5,    # Optional
      read_timeout: 5    # Optional
    )
    render json: { message: "Notification sent!" }
  end
end
```

"subscription" is the data received from the client when they subscribe for push notifications. <br>
"message" is the content of the push notification you want to send.

Trigger notifications with: <br>
```sh
curl -X POST http://localhost:3000/send_notification
```

#### Receiving the push event

Inside the service_worker.js file, we’ll handle the push event.

app/javascript/service_worker.js:
```js
self.addEventListener("push", (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/assets/icon.png",
      badge: "/assets/badge.png"
    });
  );
});
```

In this code, the push event is triggered when a push message is received.

The event data is parsed, and a notification is shown using showNotification. We can customize the notification’s content and appearance (such as adding an icon and badge).

#### Handling Click Events on Notifications

To enhance user engagement, we need to ensure that clicking a push notification takes the user to the appropriate page in our PWA.

service_worker.js:
```js
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("https://your-pwa.com"));
});
```

The clients.openWindow("https://your-pwa.com") function opens the specified URL in a new browser tab or focuses on an existing one.
This ensures that clicking on a notification will direct the user to our app, improving navigation and user experience.


### PWA and Stimulus

#### Use Stimulus to Register a Service Worker

Instead of writing raw JavaScript in application.html.erb, you can create a Stimulus controller for managing the Service Worker.

1. Create a Stimulus Controller

rails generate stimulus pwa

2. Implement Service Worker Registration in Stimulus

pwa_controller.js:
```js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service_worker.js")
        .then(registration => console.log("Service Worker Registered", registration))
        .catch(error => console.error("Service Worker Registration Failed", error));
    }
  }
}
```

3. Add Stimulus Controller to application.html.erb

```html
<body data-controller="pwa">
  <h1>My Rails PWA</h1>
</body>
```

#### Network Status Updates

Notify users when they go offline or come back online.

1. Update pwa_controller.js

```js
export default class extends Controller {
  connect() {
    window.addEventListener("offline", () => this.updateStatus("You are offline"));
    window.addEventListener("online", () => this.updateStatus("You are online"));
  }

  updateStatus(message) {
    alert(message); // You can replace this with a better UI update
  }
}
```

Do We Still Need service_worker.js? <br>
Yes! Rails cannot replace Service Workers because they are part of the browser API. However, Stimulus can help in making Service Worker management easier.

Stimulus = Enhances UI interactions (network status, push notifications, updates) <br>
Service Worker = Handles offline caching, background sync, and API preloading

For a full Rails PWA, you’ll need both Stimulus and Service Workers working together.


### Offline Fallback Pages

If a user visits an uncached page while offline, they should see an informative offline page.

offline.html.erb:
```html
<html>
<head><title>Offline</title></head>
<body>
  <h1>You are offline</h1>
  <p>Please check your internet connection and try again.</p>
</body>
</html>
```

Modify service_worker.js to serve offline.html.erb
```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline.html"))
  );
});
```
Now, if a request fails due to no connectivity, the PWA serves an offline-friendly page instead of a generic browser error.


### Local Development

While Rails applications typically use http://localhost:3000, we need HTTPS for PWA development.

* 1: Generate a Self-Signed SSL Certificate #

Run the following command to generate a local SSL certificate:

```sh
mkdir -p config/ssl
openssl req -x509 -newkey rsa:2048 -keyout config/ssl/key.pem -out config/ssl/cert.pem -days 365 -nodes -subj "/CN=localhost"
```
This generates a key and certificate valid for one year.

* 2: Configure Rails to Use HTTPS

Modify config/puma.rb to use the certificate:

```ruby
ssl_bind '127.0.0.1', '3001', {
  key: "config/ssl/key.pem",
  cert: "config/ssl/cert.pem"
}
```

Start the server with:

```sh
bin/rails s -b 'ssl://127.0.0.1:3001?key=config/ssl/key.pem&cert=config/ssl/cert.pem'
```

Now, your local Rails app runs at https://127.0.0.1:3001 with HTTPS enabled.


#### Splash Screen for iOS

Unlike Android, iOS does not fully support the Web App Manifest. Instead, we need to manually define Apple Touch Startup Images.
Create different splash screen images in PNG format for various screen sizes.

application.html.erb:
```html
<link rel="apple-touch-startup-image" href="/assets/splashscreens/iphone5.png" media="(device-width: 320px)">
<link rel="apple-touch-startup-image" href="/assets/splashscreens/iphone6.png" media="(device-width: 375px)">
<link rel="apple-touch-startup-image" href="/assets/splashscreens/ipad.png" media="(device-width: 768px)">
```

#### Theme Color for the Browser UI

The theme_color property in the manifest controls how the browser UI appears when the app is launched. <br>
Additionally, we can specify this in HTML:

<meta name="theme-color" content="#ff5722">

This ensures a consistent brand identity when users interact with the app.

#### idb-keyval
(Indexed DB Libray)

Manage web server cache

```js
import {set, get} from "idb-keyval";

set("hello","world"); # (key, val)
  .then(()=>console.log("it worked!"))
  .catch((err)=>console.log("it fails: ", err));

get("hello").then((val)=>console.log(val)) # prints: "world"
```

#### References

[Build a PWA with Ruby on Rails 8](https://blog.railsforgedev.com/how-to-build-a-progressive-web-app-with-ruby-on-rails-8-a-complete-guide)


#### Notes

[^Nt1]: In JavaScript, when working with the Fetch API and caching responses, it is necessary to clone the Response object before storing it in the cache. This is because the body of a Response object is a readable stream that can only be read once. If the original Response object were stored in the cache and its body consumed, it would no longer be available for other uses, such as returning it to the browser or further processing.