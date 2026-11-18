# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

pin "@rails/actioncable", to: "actioncable.esm.js"
pin_all_from "app/javascript/channels", under: "channels"


pin "popper", to: "popper.js", preload: true
pin "bootstrap", to: "bootstrap.min.js", preload: true

pin "idb-keyval", to: "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

# pin "chessboardjs", to: "https://ga.jspm.io/npm:@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.js"
# pin "chessboardjs", to: "https://ga.jspm.io/npm:chessboardjs@0.0.1/www/js/chessboard.js"
# pin "chessboard2", to: "@chrisoakman--chessboard2--dist--chessboard2.min.js.js" # @0.5.0
pin "chessboardjs" # @0.0.1


# pin "cm-pgn", to: "https://ga.jspm.io/npm:cm-pgn@3.3.3/src/Pgn.js"
# pin "cm-pgn", to: "https://ga.jspm.io/npm:@mateola/cm-pgn@3.3.5/src/Pgn.js"
# pin "cm-pgn"

# pin "chess.js", to: "https://ga.jspm.io/npm:chess.js@1.4.0/dist/esm/chess.js", preload: true
# pin "chess.js", to: "https://ga.jspm.io/npm:chess.js@1.0.0-beta.6/dist/esm/chess.js"
pin "chess.js", to: "chess.js--dist--esm--chess.js.js" # @1.4.0


# pin "application-backend", to: "backend/application.js", preload: true

# Pin packages: > bin/importmap pin @mateola/cm-pgn    (If you declare packages manually their dependencies will not be downloaded)
# Remove precompiled assets: > bin/rails assets:clobber
pin "cropperjs", to: "https://ga.jspm.io/npm:cropperjs@2.0.0/dist/cropper.esm.raw.js"

pin "sf18-worker", to: "mala/sf18.worker.js"
pin "sf", to: "mala/sf18.js"


# What happen if you try to:
# pin "sf18-wasm", to: "mala/sf18.wasm" ???

# May be you think you could try to 
# register the .wasm MIME type in /config/mime_types.rb

# BUT
# Rails 8 configuration for JS uses Importmaps and Propshaft.
# Because it is a "NO-Build" architecture the browser handles imports natively.
# Current browser standards does not allow downloading .wasm files directly.
# Trying to download the .wasm file results in a MIME type error:
# "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded
# with a MIME type of 'application/wasm'. Strict MIME type checking is enforced for module scripts per HTML spec."

# You cannot map or import a .wasm file using config/importmap.rb.
# You must let Propshaft handle it as a static asset and load it using
# the browser's native streaming API.
# Download, compile, and instantiate the Wasm file in streaming:

### const reponse = await fetch(digested_url)
### WebAssembly.instantiateStreaming(response)

