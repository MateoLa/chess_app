class CreateGames < ActiveRecord::Migration[8.1]
    def change
        create_table :games do |t|
            t.string :mode, default: "classic"
            t.string :vs
            t.string :state
            t.string :turn
            t.integer :white_player_id
            t.integer :black_player_id
            t.string :fen, default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
            t.string :pgn
            t.integer :white_timer
            t.integer :black_timer
            t.string :level
            t.boolean :is_private, default: false
            t.references :variant
      
            t.timestamps
        end
    end
end

