class PwaController < ApplicationController
#	protect_from_forgery except: :stockfish
	skip_forgery_protection
	skip_before_action :authenticate_user!, raise: false

	def service_worker
		render template: "pwa/service-worker", layout: false
	end

	def manifest
		render template: "pwa/manifest", layout: false
	end


    def stockfish
#        response.headers["expires"] = "0"
#        response.headers["Cache-Control"] = "max-age=0, must-revalidate"; # Add "no-cache" to force the browser not to cache the file at all.
        response.headers["Access-Control-Allow-Origin"] = "*";
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Accept-Ranges"] = "bytes";
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'";
        respond_to do |format|
            format.js { render file: Rails.root.join("vendor/javascript/mala/#{params[:file]}.js"), content_type: "application/javascript" }
            format.wasm { render file: Rails.root.join("vendor/javascript/mala/#{params[:file]}.wasm"), content_type: "application/wasm" }
        end
    end
end