module Admin
  class GamesController < Admin::BaseController

    before_action :set_game, only: [:show, :destroy]

    # GET /games or /games.json
    def index
      @games_played = Game.played
      @games_in_progress = Game.where(state: :in_progress).order(updated_at: :desc)
      @games = Game.all
    end

    # GET /games/1 or /games/1.json
    def show; end

    # DELETE /games/1 or /games/1.json
    def destroy
      @game.destroy

      respond_to do |format|
        format.html { redirect_to admin_games_url, notice: 'Game was successfully destroyed.' }
        format.json { head :no_content }
      end
    end
  
    private
  
    # Use callbacks to share common setup or constraints between actions.
    def set_game
      @game = Game.find(params[:id])
    end
  
    # Only allow a list of trusted parameters through.
    def game_params
      params.require(:game).permit(
        :color,
        :challenger_id,
        :challengee_id
      )
    end

  end
end