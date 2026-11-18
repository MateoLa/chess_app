class GamesController < ApplicationController
	include TokenGenerator
	include ColorConcerns
    include RoomsHelper
	include GamesHelper

	before_action :set_game, only: %i[update destroy]
	before_action :load_preferences

	def analyzer; end

	def design; end

	def vsbot
		@token = generate_token
		@color = game_params[:color]

		@mode = game_params[:mode]
		@variant = Variant.find(game_params[:variant_id])
		update_preferences(mode: @mode, variant_id: @variant.id)

		@users = User.all_except(current_user)
		if current_user
			@game = Game.new(game_params)
			if @game.save
				Player.create(game: @game, user_id: current_user.id)
				render bot_game_path, notice: t(:successfully_created)
			else
				redirect_back fallback_location: root_path, status: t(:unprocessable_content)
			end
		else
			@game = fake_game
puts "Fake Game: ", @game

			render bot_game_path, notice: t(:successfully_created)
		end
	end

	def bot
		@users = User.all_except(current_user)

		if params[:id].present?
			@game = Game.find(params[:id]) 
			@color = current_user.id == @game.white_player_id ? "white" : "black"
puts "Game Rails ID: ", @game.id
			if verify_user(@game) 
				render bot_game_path
			else
 				redirect_back fallback_location: root_path, status: t(:unprocessable_content)
			end
		else
			redirect_to root_path, status: :unprocessable_content
		end
	end



	def anonymous
		@token = params[:token]
		@color = params[:color]

		@mode = params[:mode]
		@variant = Variant.find(params[:variant_id])
		@game = fake_game

		update_preferences(mode: @mode, variant_id: @variant.id)
		@users = User.all_except(current_user)

		if @token
			render template: "games/game", notice: t(:successfully_created)
		else
			redirect_back fallback_location: root_path, alert: t(:unprocessable_entity)
		end
	end

	def play
		@token = params[:token]
		@game = Game.find(params[:id])
		@color = current_user.id == @game.white_player_id ? "white" : "black"
		
puts "Game Rails ID: ", @game.id
		update_preferences(mode: @game.mode, variant_id: @game.variant_id)
		@users = User.all_except(current_user)

		if verify_user(@game)
			render template: "games/game", notice: t(:successfully_created)
		else
			redirect_back fallback_location: root_path, alert: t(:unprocessable_entity)
		end
	end

	# GET /games or /games.json
	def index
		@games_inprogress = Game.where(state: :in_progress).order(updated_at: :desc).limit(20)
	end

	# GET /games/1 or /games/1.json
	def show
		@game = Game.find(params[:id])
	end

	# GET /games/new
	def new
		@game = Game.new
		puts @game
	end

	# GET /games/1/edit
	def edit
		@controller = params[:control]
		if @controller == "engine"
			
		else
			@game = Game.find(params[:id])
		end
	end

	# POST /games or /games.json
	def create
		update_preferences(game_params)
		variant = Variant.find(game_params[:variant_id])
		assign_colors    # This has sense vs Bot

		@game = Game.new(
			mode: game_params[:mode],
			vs: "player",
			white_player_id: params[:game][:white_player_id],
			black_player_id: params[:game][:black_player_id],
			variant_id: variant.id,
			white_timer: variant.timer,
			black_timer: variant.timer,
			level: game_params[:level]
		)

		respond_to do |format|
			if @game.save
				Player.create(game: @game, user_id: game_params[:challenger_id])
				Player.create(game: @game, user_id: game_params[:challengee_id])
				format.html { redirect_to edit_game_path(@game), notice: t(:successfully_created) }
				format.json { render :edit, status: :created, location: @game }
			else
				format.html { render :new, status: :unprocessable_content }
				format.json { render json: {message: "Failed to create Game", errors: @game.errors}, status: :unprocessable_content }
			end
		end
	end

	# PATCH/PUT /games/1 or /games/1.json
	def update
		respond_to do |format|
			if @game.update(game_params)
				format.html { redirect_to game_url(@game), notice: t(:successfully_updated) }
				format.json { render :show, status: :ok, location: @game }
			else
				format.html { render :edit, status: :unprocessable_content }
				format.json { render json: @game.errors, status: :unprocessable_content }
			end
		end
	end

	# DELETE /games/1 or /games/1.json
	def destroy
		@game.destroy

		respond_to do |format|
			format.html { redirect_to games_url, notice: 'Game was successfully destroyed.' }
			format.json { head :no_content }
		end
	end

	private

	def game_params
		params.expect(game: [:mode, :variant_id, :color, :level])
	end

	def update_preferences(preferences)
		valid_preferences = preferences.slice(*Preference.attribute_names)
		current_user ?
			current_user.preference.update!(valid_preferences) :
			GuestPreferenceService.update_guest_preference(cookies, valid_preferences)
	end

	def set_game
		@game = Game.find(params[:id])
	end

	def verify_user(game)
		game.white_player_id == current_user.id || game.black_player_id == current_user.id
	end

	def fake_game
		game = {
			id: "",
			mode: @mode,
			white_player_id: nil,
			black_player_id: nil,
			fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
			white_timer: @variant.timer,
			black_timer: @variant.timer,
			level: game_params[:level],
			updated_at: ""
		}

		gameStruct = Struct.new(*game.keys)
		return gameStruct.new(*game.values)

		# Rails path helpers call .to_param on objects passed on them.
		# Struct does not implement to_param by default
		# The same happens with Data.define  
	end
end
