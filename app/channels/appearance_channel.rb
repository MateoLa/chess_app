class AppearanceChannel < ApplicationCable::Channel

    def subscribed
        if connection.guest?
            reject
        else
            stream_from "appearance_channel"
        end
    end

    def unsubscribed
        # Any cleanup needed when channel is unsubscribed
        stop_stream_from "appearance_channel"
        offline
    end

    def online
        status = User.statuses[:online]
        update_server_status(status)
    end

    def away
        status = User.statuses[:away]
        update_server_status(status)
    end

    def offline
        status = User.statuses[:offline]
        update_server_status(status)
    end

    def receive(data)
        ActionCable.server.broadcast("appearance_channel", data)
    end

    private

    def update_server_status(status)
        return if connection.guest?
        user = User.find_by(id: current_user.id)
        user.update!(status: status) unless user.dnd?
    end
end
