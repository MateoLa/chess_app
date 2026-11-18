## Html


#### Scan web page and report recommended changes

Review your headers.

[SecurityHeaders.io](https://securityheaders.io/)


#### Sessions

Session variables are typically set either when a user logs in or when a new connection to the application is established.

User Login:
When a user successfully logs into an application, the server usually initializes a new session to store information for that user. 

New Connection:
Even without explicit login, a new connection to an application can trigger the creation of a new session. Each user's browser may have a unique session associated with their connection.

In essence, session variables are a mechanism to maintain a user's state and data across multiple requests to an application. They are crucial for features like user authentication, personalized content, and tracking user activities.

Session --> Server Side
Cookie --> Client Side


#### Browser's Caching

JavaScript can be used to manage and influence the caching of image requests in a web browser, leveraging various browser APIs and techniques.

1. Browser's HTTP Cache (Implicit Caching):
    Browsers automatically cache resources, including images, based on HTTP cache headers (e.g., Cache-Control, Expires, ETag, Last-Modified) provided by the server. When an image is requested again, the browser checks its cache and, if the cached version is fresh or can be validated with a conditional request to the server, it serves the image from the cache, avoiding a full download. JavaScript doesn't directly control this mechanism.

2. Service Workers and Cache API (Explicit Caching):
    Service Workers, running in the background, can intercept network requests and respond with cached assets using the CacheStorage and Cache APIs.This provides fine-grained control over caching, enabling features like offline access and custom caching strategies.
    JavaScript code within the service worker defines the caching logic. For images, this typically involves:
    * Installation: Pre-caching critical images during service worker installation.
    * Fetch interception: Intercepting image requests and checking if a cached version exists before fetching from the network. If not, fetching, caching, and then returning the response.

3. In-memory Caching with JavaScript:
    Images can be preloaded into the browser's memory using JavaScript, making them readily available for subsequent use without requiring a network request or even relying on the browser's HTTP cache.
    ```js
    const image = new Image();
    image.src = 'path/to/your/image.jpg';
    ```
    The image is now in memory and can be used later by setting the src of other image elements.

4. Local Storage or IndexedDB (Data Storage):
    While not directly caching the image request, images can be stored as Base64 encoded strings or Blob objects in localStorage or IndexedDB. This allows for persistent storage and retrieval of image data without network requests.

#### Server Side Caching (Rails Cache)

* Fragment Caching

* Russian Doll Caching

* Shared Partial Caching

* Low-Level Caching using Rails.cache

```ruby
class Product < ApplicationRecord
  def competing_price
    Rails.cache.fetch("#{cache_key_with_version}/competing_price", expires_in: 12.hours) do
      Competitor::API.find_price(id)
    end
  end
end
```

* SQL Caching


