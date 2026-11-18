class SignalingServerChannel < ApplicationCable::Channel

    def subscribed
        if connection.guest?
            reject
        else
            stream_from "SignalingServerChannel"
        end
    end

    def unsubscribed
        # Any cleanup needed when channel is unsubscribed
        stop_stream_from "SignalingServerChannel"
    end
end
