class PagesController < ApplicationController
    include PagesHelper
    include RoomsHelper
    include GamesHelper

#    skip_before_action :authenticate_user!, raise: false

    before_action :load_preferences
    before_action :recent_messages, only: [:home]
#    after_action :set_status

    def home
        recent_messages
        @online_users = User.where.not(status: User.statuses[:offline]).count
        @users = User.all_except(current_user)
        @rooms = search_rooms
        @single_room = Room.find_or_create_by(name: "General")
        @game = Game.new

        if current_user
            current_user.update(current_room: @single_room)
            @joined_rooms = current_user.joined_rooms.order('last_message_at DESC')
            @message = Message.new
            pagy_messages = @single_room.messages.includes(:user).order(created_at: :desc)
            @pagy, messages = pagy(pagy_messages, items: 10)
            @messages = messages.reverse
#            set_notifications_to_read
        end
    end

    def offline; end

    private
 
    def set_status
        current_user&.update!(status: User.statuses[:offline])
    end

    def recent_messages
        public_rooms = Room.public_rooms
        @messages = Message.where(room: public_rooms).order(created_at: :desc).limit(5)
    end

    def set_notifications_to_read
        notifications = @single_room.notifications_as_room.where(recipient: current_user).unread
        notifications.update_all(read_at: Time.zone.now)
    end
end

