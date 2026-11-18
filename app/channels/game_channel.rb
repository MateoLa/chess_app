class GameChannel < ApplicationCable::Channel
	def subscribed
		stream_from "game_#{params[:token]}"
	end

	def unsubscribed
		# Any cleanup needed when channel is unsubscribed
		stop_all_streams    # Unsubscribes the user from all the Game Channels.
	end

	def movement(data)
puts "Game Movement: ", data
puts ""
		game = Game.find(data["game_id"]) if data["game_id"]
		if game && verify_user(game)
			wtimer = data["wtimer"]
			btimer = data["btimer"]
			move = data["move"]
			nr = data["moveNumber"]

			color = move["color"]
			color == "w" ? game.white_timer = wtimer : game.black_timer = btimer
			game.fen = move["after"]
			game.pgn = game.pgn + " " + writeMove(color, nr, move["san"]) + " " + setComment(color, wtimer, btimer)
			game.turn = data["turn"]
			game.save!
		end
		ActionCable.server.broadcast "game_#{params[:token]}", data
	end

	def gameover(data)
		if data["game_id"]
			game = Game.find(data["game_id"])
			game.pgn = game.pgn + data["pgn"]
			game.state = data["state"]
			game.save!
		end
	end

	private

	def verify_user(game)
		game.white_player_id == current_user.id || game.black_player_id == current_user.id
	end

	def writeMove(color, nr, san)
		color == "w" ? "#{nr}. #{san}" : san
	end

	def setComment(color, wtimer, btimer)
		timer = color == "w" ? wtimer : btimer
		"[%clk #{timer}]"
	end
end
