module GamesHelper

	def mode_select_options
    	Game::MODE.map do |mode|
			[ t("mode_option.#{mode}"), mode ]
		end
	end

	def level_select_options
    	Game::LEVEL.map do |level|
			[ t("level_option.#{level}"), level ]
		end
	end

	def variant_select_options
		variants = Variant.where(name: Variant::ON).map do |variant|
			{ text: t("variant_option.#{variant.name}"), 
			value: variant.id, 
			emo: variant.emoji,
			speed: t("speed_option.#{variant.speed}")
			}
		end

        options = variants.map do |opt|
            "<option value=#{opt[:value]} #{" selected" if opt[:value] == @variant.id}>
                <span aria-hidden='true'> #{opt[:emo]} </span>
                <span> #{opt[:text]} </span>
                <span> #{opt[:speed]} </span>
            </option>"
		end

		return options
	end

	def fake?(game)
		game.white_player_id == nil && game.black_player_id == nil
	end

	def opponent(color, game)
		return unless game
		id = color == "white" ? game.black_player_id : game.white_player_id
		return User.find(id) if id
	end

	def pieceTheme(theme)
    	pieces = ["wN", "wB", "wR", "wQ", "wK", "wP", "bN", "bB", "bR", "bQ", "bK", "bP"]

		paths = {}
		pieces.map { |p| paths[p] = image_path("chesspieces/#{theme}/#{p}.png") }
		return paths
	end

	def bots
		[
			"png/Pikafish_Logo.png",
			"svg/stockfish.svg",
			"svg/robot.svg"
		]
	end
end
