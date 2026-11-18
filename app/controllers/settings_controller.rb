class SettingsController < ApplicationController
	before_action :load_preferences, only: :show

	def show
		@board_themes = Preference::BOARD_THEMES
		@piece_themes = Preference::PIECE_THEMES
	end

	def update
		if update_preference(setting_params.to_hash)
			render json: { message: t(:successfully_updated) }, status: :ok
		else
			render json: { message: "Failed to Update Preference" }, status: :unprocessable_content
		end
	end

	private

	def setting_params
		params.require(:setting).permit(:locale, :theme, :mode, :variant, :color, :level, :board_theme, :piece_theme)
	end

	def update_preference(preferences)
		current_user ?
			current_user.preference.update!(preferences) :
			GuestPreferenceService.update_guest_preference(cookies, preferences)
	end
end