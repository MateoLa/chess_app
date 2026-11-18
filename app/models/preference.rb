class Preference < ApplicationRecord

  BOARD_THEMES = ["Chess24", "Metro", "Leipzig", "Wikipedia", "Uscf", "Dilena", "Symbol", "Default"].freeze
  PIECE_THEMES = ["Alpha", "Beyer", "Chess24", "Condal", "Dilena", "Leipzig", "Metro", "Merida", "Symbol", "Uscf", "Wikipedia"].freeze

  belongs_to :user
end
