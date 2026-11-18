module Admin
  class UsersController < Admin::BaseController

    # GET /games or /games.json
    def index
      @users = User.all
    end

    # GET /games/1 or /games/1.json
    def show; end

  end
end
