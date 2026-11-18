class UsersController < ApplicationController
    include GamesHelper
    include RoomsHelper

#    before_action :authenticate_user!    # Trigger Warden's session load
    before_action :load_preferences

    def show
        @user = User.find(params[:id])
        @users = User.all_except(current_user)

        @room = Room.new
        @joined_rooms = current_user.joined_rooms
        @rooms = search_rooms
        @room_name = get_name(@user, current_user)
        @single_room = Room.where(name: @room_name).first || Room.create_private_room([@user, current_user], @room_name)
        current_user.update(current_room: @single_room)

        @message = Message.new

        pagy_messages = @single_room.messages.includes(:user).order(created_at: :desc)
        @pagy, messages = pagy(pagy_messages, items: 10)
        @messages = messages.reverse

        render 'rooms/index'
    end

    def games
        @users = User.all_except(current_user)

        current_user.games.in_progress.each do |game| 
            update_state(game)
        end

        @games_inprogress = current_user.games.in_progress.order(
            Arel.sql(
                "CASE
                    WHEN (white_player_id = '#{current_user.id}' AND turn = 'w') THEN white_timer
                    WHEN (black_player_id = '#{current_user.id}' AND turn = 'b') THEN black_timer
                END ASC,
                CASE 
                    WHEN (white_player_id = '#{current_user.id}' AND turn = 'b') THEN white_timer
                    WHEN (black_player_id = '#{current_user.id}' AND turn = 'w') THEN black_timer
                END ASC"
            )
        )
        @games_played = current_user.games.played
    end

    def game
        @game = Game.find(params[:id])
    end

    private

    def update_state(game)
        elapsed = (Time.current - game.updated_at).floor
        timer = (game.turn == "w") ? [0, game.white_timer - elapsed].max : [0, game.black_timer - elapsed].max
        if (timer == 0) 
            game.turn == "w" ? game.white_timer = 0 : game.black_timer = 0
            game.state = "timeout"
            game.save!
        end
    end

end

