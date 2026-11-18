class ChallengeChannel < ApplicationCable::Channel
	include Rails.application.routes.url_helpers

	def subscribed
		stream_for current_user
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
		stop_all_streams    # Unsubscribes the user from all the Pairing channels.
	end

	def challenge(data)
puts "Current User: ", current_user
		data["challenger"] = current_user.id
		if current_user.avatar.attached?
			avatar_variant = current_user.avatar.variant(:micro)
			avatar_path = rails_representation_url(avatar_variant)	# or rails_blob_url when not using variants
			data["avatar"] = avatar_path
		end
		data["username"] = current_user.username
		data["gamemode"] = I18n.t("mode_option.#{data["mode"]}")
		variant = Variant.find(data["variant"])
		data["gamevariant"] = variant.name
        player = User.find(data["player"])
		data["event"] = "propagate"
		ChallengeChannel.broadcast_to(player, data) if player.status == "online"
	end

	def accepted(data)
		challenger = User.find(data["challenger"])
		game = create_game(data, challenger.id)

		data["game_id"] = game&.id
		data["event"] = "accepted"
		ChallengeChannel.broadcast_to(current_user, data)
		ChallengeChannel.broadcast_to(challenger, data)
	end

	def rejected(data)
		challenger = User.find(data["challenger"])
		
		data["event"] = "rejected"
puts "Rejected Game to user ", challenger
		ChallengeChannel.broadcast_to(challenger, data)
	end

	private

	def create_game(data, player_id)
		color = ["white", "black"].sample
puts "GCreate Data: ", data
		game = {
			mode: data["mode"],
			vs: "player",
			variant_id: data["variant"],
			white_player_id: (color == "white" ? player_id : current_user.id),
			black_player_id: (color == "white" ? current_user.id : player_id)
		}
puts "Game Hash: ", game
		game = Game.new(game)
puts "Game Instance: ", game
		Player.create(game: game, user_id: current_user.id)
		Player.create(game: game, user_id: player_id)
		return game
	end

end

