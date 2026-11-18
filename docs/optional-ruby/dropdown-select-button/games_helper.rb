module GamesHelper

	def game_mode_select_options
    	Game::MODE.map do |mode|
			{ name: mode, locale: t("mode_option.#{mode}") }
		end
	end

	def game_level_select_options
    	Game::LEVEL.map do |level|
			{ name: level, locale: t("level_option.#{level}") }
		end
	end

	def variant_select_options
		Variant.where(name: Variant::ON).map do |variant|
			{ icon: variant.icon, name: variant.name, locale: t("variant_option.#{variant.name}"), attr: t("speed_option.#{variant.speed}") }
		end
	end

	def playerCard(user, timer = nil)
		card = {}

		case user
		when "vsbot"
			card[:name] = t(:computer)
			card[:avatar] = image_path("png/Pikafish_Logo.png")
		when "guest"
			card[:name] = t(:guest)
			card[:avatar] = image_path("png/question-mark.png")
		else
			card[:name] = user.username
			card[:avatar] = user.avatar.variant(:inline) if user.avatar.attached?
		end
		card[:timer] = FormatTimer(timer) if timer

		return card
	end

	def FormatTimer(time)
		sec = time
		min = (sec / 60).floor
		hrs = (min / 60).floor
		days = (hrs / 24).floor
		sec -= min * 60
		min -= hrs * 60
		hrs -= days * 24
		if days > 0 
			return days.to_s + " " + t(:days)
		elsif hrs > 0 
			return hrs.to_s.rjust(2, "0") + ":" + min.to_s.rjust(2, "0") + ":" + sec.to_s.rjust(2, "0")
		else 
			return min.to_s.rjust(2, "0") + ":" + sec.to_s.rjust(2, "0")
		end
	end

	def pieceTheme(piece_theme)
    	pieces = ["wN", "wB", "wR", "wQ", "wK", "wP", "bN", "bB", "bR", "bQ", "bK", "bP"]

		paths = {}
		pieces.map { |p| paths[p] = image_path("chesspieces/#{piece_theme}/#{p}.png") }
		return paths
	end

	def pieceAssets
		themes = Preference::PIECE_THEMES
    	pieces = ["wN", "wB", "wR", "wQ", "wK", "wP", "bN", "bB", "bR", "bQ", "bK", "bP"]

		paths = {}
		themes.map { |t| paths[t] = pieces.to_h { |p| [p, image_path("chesspieces/#{t}/#{p}.png")] }};
		return paths
	end

end
