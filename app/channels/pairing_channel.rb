class PairingChannel < ApplicationCable::Channel
	include TokenGenerator

	def subscribed
		stream_for current_user
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
		stop_all_streams    # Unsubscribes the user from all the Pairing channels.
	end

	def receive(data)
puts "Pairing: ", data
puts ""
		mode = data["mode"]
		variant = data["variant"]
		player = Rails.cache.fetch(variant, namespace: mode, expires_in: 60.seconds) do
			current_user
		end

		if current_user != player
			Rails.cache.delete(variant, namespace: mode)

			color = ["white", "black"].sample
			player_color = color == "white" ? "black" : "white"
			game = create_game(mode, variant, player, color)

			data["token"] = generate_token 
			data["game_id"] = game&.id 
			PairingChannel.broadcast_to(current_user, data.merge(color: color))
			PairingChannel.broadcast_to(player, data.merge(color: player_color))
		end
	end

	private

	def create_game(mode, variant, player, color)
		return if guest?(current_user) || guest?(player)

		game = {
			mode: mode,
			vs: "player",
			variant_id: variant
		}
		game[:white_player_id] = color == "white" ? current_user.id : player.id
		game[:black_player_id] = color == "white" ? player.id : current_user.id

		game = Game.new(game)
		Player.create(game: game, user_id: current_user.id)
		Player.create(game: game, user_id: player.id)

		return game
	end

	def guest?(user)
		user.is_a?(String)
	end
end

