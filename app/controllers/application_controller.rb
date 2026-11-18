class ApplicationController < ActionController::Base
	include Pagy::Method

	# Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
	allow_browser versions: :modern

	# Changes to the importmap will invalidate the etag for HTML responses
 	stale_when_importmap_changes

	add_flash_types :error, :info, :success
#	before_action :add_headers


	def after_sign_in_path_for(resource)
		stored_location_for(resource) || root_path
	end

	protected

	def load_preferences
		I18n.locale = get_preference(:locale) || I18n.default_locale
		@theme = get_preference(:theme) || "light"
		@mode = get_preference(:mode) || "classic"
		variant = get_preference(:variant_id) || 8
		@variant = Variant.find(variant)
		@level = get_preference(:level) || "beginner"
		@board_theme = get_preference(:board_theme) || Preference::BOARD_THEMES.sample
		@piece_theme = get_preference(:piece_theme) || Preference::PIECE_THEMES.sample
	end

	
	def get_preference(key)
		if current_user
			return current_user.preference[key]
		elsif cookies[key].present? 
			return cookies[key]
		end
	end

	private

	def add_headers
        if request.format.symbol == :wasm
			puts "Mateoooooooooooooooooooooooooooo\n"
			response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
			response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
			response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
		end
	end
end
