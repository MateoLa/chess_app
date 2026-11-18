class User < ApplicationRecord
    STATUSES = ["away", "dnd", "offline", "online"]

    # Include default devise modules. Others available are: :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
    devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable

    has_one :preference, dependent: :destroy 
    has_many :players
    has_many :games, through: :players
    has_many :joinables, dependent: :destroy
    has_many :joined_rooms, through: :joinables, source: :room
    has_many :rooms, through: :joinables
    has_many :messages

    has_one_attached :avatar, dependent: :destroy do |attachable|
        attachable.variant :thumb, resize_to_limit: [150, 150], preprocessed: true
        attachable.variant :inline, resize_to_limit: [50, 50], preprocessed: true
        attachable.variant :micro, resize_to_limit: [26, 26], preprocessed: true
    end
    # The preprocessed: true argument tells Rails to create the variant  
    # immediatly after the avatar. It is created in a TransformJob in the background

    enum :role, [:user, :admin]
    enum :status, [:away, :dnd, :offline, :online]
  
    normalizes :email, with: ->(e) { e.strip.downcase }

    validates :email, presence: true, uniqueness: true
    validates_uniqueness_of :username, required: true, case_sensitive: false
    validates :status, inclusion: { in: STATUSES }, allow_blank: true
    validates :avatar, content_type: ['image/png', 'image/jpeg'], size: { less_than: 5.megabytes }

    after_initialize :set_default_role, :build_default_preference, if: :new_record?
    after_commit :add_default_avatar, on: [:create, :update]  

    scope :all_except, -> (user) { where.not(id: user) }
    scope :online_except, -> (user) { where(status: "online").where.not(id: user) }

#    broadcasts_refreshes_to ->(user) { "users_list" }
#    after_create_commit { broadcast_append_to 'users' }
    after_update_commit { broadcast_update }


    def game_in_progress_with(target_user)
        games
            .where(id: target_user.games) 
            .where(state: :in_progress)
    end

    def status_to_css
        case status
        when "away"
            "bg-warning"
        when "dnd"
            "bg-danger"
        when "offline"
            "bg-dark"
        when "online"
            "bg-success"
        else
            "bg-dark"
        end
    end

    def has_joined_room(room)
        joined_rooms.include?(room)
    end

    private

    def broadcast_update
        broadcast_update_to 'user_status', partial: 'users/status', locals: { user: self }
        broadcast_update_to 'arena_user', partial: 'users/arena_user', locals: { user: self }
    end

    def set_default_role
        self.role ||= :user
    end

    def build_default_preference
        self.build_preference(
            theme: "light", 
            locale: "es", 
            mode: "classic", 
            variant_id: 8, 
            level: "beginner", 
            board_theme: "Wikipedia", 
            piece_theme: "Wikipedia"
        )
    end

    def add_default_avatar
        return if avatar.attached?
        AvatarProcessorJob.perform_later(id)
    end
end
