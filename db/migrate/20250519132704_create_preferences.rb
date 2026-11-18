class CreatePreferences < ActiveRecord::Migration[8.1]
    def change
        create_table :preferences do |t|
            t.string :theme, default: "light"
            t.string :locale, default: "es"
            t.string :mode, default: "classic"
            t.string :variant_id, default: 8
            t.integer :level, default: "beginner"
            t.string :board_theme, default: "Wikipedia"
            t.string :piece_theme, default: "Wikipedia"
            t.references :user, null: false, foreign_key: true

            t.timestamps
        end
    end
end
