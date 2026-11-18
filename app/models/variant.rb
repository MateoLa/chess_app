class Variant < ApplicationRecord
    extend Mobility
    translates :description, type: :string

    SPEED = ["bullet", "blitz", "rapid", "classic", "daily"].freeze
    ON = ["1+0", "3+2", "10+5", "30+0", "1 day"].freeze

    validates :speed, inclusion: { in: SPEED }, allow_blank: true

    def emoji
        case speed
            when "bullet"
                "\u{1F680}"
            when "blitz"
                "\u{26A1}"
            when "rapid"
                "\u{2708}"
            when "classic"
                "\u{23F1}"
            when "daily"
                "\u{2600}"
            else
                "\u{1F514}"
        end
    end

    def src
        case speed
            when "bullet"
                "svg/rocket-takeoff.svg"
            when "blitz"
                "svg/lightning.svg"
            when "rapid"
                "svg/airplane.svg"
            when "classic"
                "svg/clock.svg"
            when "daily"
                "svg/sun.svg"
            else
                "svg/bell.svg"
        end
    end
end
