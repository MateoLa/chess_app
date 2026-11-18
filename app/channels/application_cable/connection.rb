# frozen_string_literal: true

module ApplicationCable
    class Connection < ActionCable::Connection::Base
        identified_by :current_user
        attr_reader :warden

        def connect
            self.current_user = set_current_user
        end

        def guest?
            current_user.is_a?(String)
        end

        private

        def set_current_user
            if verified_user = request.env['warden'].user
                cookies.encrypted[:user_id] = verified_user 
                verified_user
            elsif cookies.encrypted[:user_id]
                cookies.encrypted[:user_id]
            else
                guest_uuid = SecureRandom.uuid
                cookies.encrypted[:user_id] = {value: guest_uuid, expires: 1.year.from_now}
                guest_uuid
            end
        end
        #   To allow unauthenticated connections to Action Cable  
        #   do not call reject_unauthorized_connection.
    end
end


#module ApplicationCable (v.2)
#    class Connection < ActionCable::Connection::Base
#        identified_by :current_user
#        attr_reader :warden
#
#        def connect
#            @warden = env['warden']
#            self.current_user = @warden.user || reject_unauthorized_connection
#        end
#
#        #   To authenticate Action Cable connections using Devise / Warden, you must hook into 
#        #   the Rack environment (env['warden']) directly.
#        #   For View Rendering directly inside your Action Cable channels using ApplicationController.render
#        #   you must preserve @warden
#    end
#end


#module ApplicationCable  (v.1)
#    class Connection < ActionCable::Connection::Base
#        identified_by :current_user
#        attr_reader :warden
#
#        def connect
#            set_current_user || reject_unauthorized_connection
#            @warden = env['warden'] if current_user
#        end
#        private
#
#        def set_current_user
#            if verified_user = env['warden'].user
#                self.current_user = verified_user
#            end
#        end
#    end
#end
