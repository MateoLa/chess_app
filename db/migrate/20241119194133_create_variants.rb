class CreateVariants < ActiveRecord::Migration[8.1]
  def change
    create_table :variants do |t|
      t.string :speed
      t.string :name
      t.text :description
      t.integer :timer
      t.integer :time_increment

      t.timestamps
    end
  end
end




