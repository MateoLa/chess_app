# Configure ActionController (routing and respond_to blocks).
# Mime::Type.register "application/wasm", :wasm

# Serve a static .wasm file directly from /public folder or the asset pipeline.
# Explicitly tell Rack how to handle the extension.
# Forcing a custom mapping for raw Rack 3 compatibility:
# Rack::Mime::MIME_TYPES[".wasm"] = "application/wasm"

# Rails 8 configuration for JS uses Importmaps and Propshaft.
# Because it is a "NO-Build" architecture the browser handles imports natively.
# Current browser standards does not allow downloading .wasm files directly, 
# See comments in config/importmap.rb