module Admin
  class DashboardController < Admin::BaseController
  
    def show
      @games = Game.where(state: "in_progress").order(updated_at: :desc).limit(10)
    end

  end
end
