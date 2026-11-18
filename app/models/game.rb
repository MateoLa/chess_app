class Game < ApplicationRecord

	NOTABLE = ["Anderssen", "Burn", "Byrne", "Capablanca", "Dufresne", "Fischer", "Kasparov", "Kieseritzky", "Lasker", "Steiner", "Tal", "Tarrasch", "Tolush", "Topalov", "Visockis"].freeze

	MODE = ["classic", "960"].freeze
	VS = ["player", "bot"].freeze
	LEVEL = ["advanced", "intermediate", "beginner"].freeze
#	EVENT = ["onLine", "vsBot", "OTB"].freeze
	TURN = ["w", "b"].freeze
	STATE = ["in_progress", "checkmate", "draw", "timeout", "abandon"].freeze

	has_many :players, dependent: :destroy
	has_many :users, through: :players
	belongs_to :variant, optional: true

	attribute :color
	attribute :state, :string, default: "in_progress"
	attribute :turn, :string, default: "w"


	scope :public_games, -> { where(is_private: false) }
	scope :played, -> { where.not(state: "in_progress").order(updated_at: :desc) }
	scope :in_progress, -> { where(state: :in_progress) }


	before_create :set_start_fen
	before_create :set_pgn_header
#	before_create :create_token

	validates :mode, inclusion: { in: MODE }
	validates :state, inclusion: { in: STATE }
	validates :turn, inclusion: { in: TURN }
	validates :level, inclusion: { in: LEVEL }, allow_blank: true

#	after_create_commit { broadcast_append_to 'games' }

	def set_start_fen
		self.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
#		self.fen = '7k/4P3/8/8/8/8/8/7K w - - 0 1'    #Promotion
	end

	def set_pgn_header
		white_player = User.find(white_player_id) if white_player_id
		black_player = User.find(black_player_id) if black_player_id

		self.pgn = %{
			[Site "Chess App"]
			[Date "#{Date.current}"]
			[Time "#{Time.current}"]
			[Round "-"]
			[White "#{white_player&.username}"]
			[Black "#{black_player&.username}"]
			[Result ""]
			[WhiteElo ""]
			[BlackElo ""]
			[Variant "#{variant&.name}"]
			[TimeControl "#{variant&.timer}"]
			[Increment "#{variant&.time_increment}"]
			[ECO ""]
			[Opening ""]
			[Termination ""]
			[PlayCount ""]
			[UTCDate "#{Date.current}"]
			[UTCTime "#{Time.current}"]
			[WhiteRatingDiff "-4"]
			[BlackRatingDiff "+1"]
		}
	end

	# used to rotate board for black player
	def orientation(user)
		black_player_id == user&.id ? "black" : "white"
	end

	def winner
		turn === "w" ? "black" : "white" if ["checkmate", "timeout", "abandon"].include? state
	end

	def self.total_games_by_day
    	daily_events = Ahoy::Event.where(name: 'Played Games')
		daily_events.group_by_day(:time, range: 1.month.ago..Time.now).count
	end
end
