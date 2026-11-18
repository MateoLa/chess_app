module ColorConcerns
    extend ActiveSupport::Concern
    # This has sense on rematchs

    def get_colors(color_choice)
        if color_choice == "white"
            "w"
        elsif color_choice == "black"
            "b"
        else
            # randomize
            %i[w b].sample
        end
    end

    def assign_colors
        color_choice = get_colors(params[:game][:color])

        if color_choice == "w"
            params[:game][:white_player_id] = params[:game][:challenger_id]
            params[:game][:black_player_id] = params[:game][:challengee_id]
        else
            params[:game][:white_player_id] = params[:game][:challengee_id]
            params[:game][:black_player_id] = params[:game][:challenger_id]
        end
    end
end
