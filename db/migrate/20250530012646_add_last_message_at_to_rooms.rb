class AddLastMessageAtToRooms < ActiveRecord::Migration[8.1]
  def change
    add_column :rooms, :last_message_at, :datetime
  end
end
