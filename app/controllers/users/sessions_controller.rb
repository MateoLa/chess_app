# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
    # before_action :configure_sign_in_params, only: [:create]
    # before_action :set_current_game

    # GET /resource/sign_in
    # def new
    #   super
    # end

    # POST /resource/sign_in
    def create    
        super

        resource.update(status: User.statuses[:online])
        if resource.persisted? && GuestPreferenceService.guest_preferences_present?(cookies)
            GuestPreferenceService.transfer_preferences_to_user(cookies, resource)
        end
    end

    # DELETE /resource/sign_out
    def destroy
        ActionCable.server.remote_connections.where(current_user: current_user).disconnect
        current_user.update(status: User.statuses[:offline])
        super
    end

    # protected

    # If you have extra params to permit, append them to the sanitizer.
    # def configure_sign_in_params
    #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
    # end
end
