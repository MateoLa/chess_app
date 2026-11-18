class AvatarProcessorJob < ActiveJob::Base
    queue_as :default

    def perform(user_id)
        user = User.find_by(id: user_id)
        string = avatar_string(user)

        Avatar.new(user, string).call
    end

    private

    def avatar_string(user)
        user.username || user.email
    end

end

