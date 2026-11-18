require "ostruct"

module PagesHelper

    PGN_FILE = [
        "century_game_1956.pgn", 
        "immortal_game_1851.pgn", 
        "kasparov_topalov_1999.pgn", 
        "the_evergreen_1852.pgn"
    ]

    def load_notable
        text = File.read(Rails.root.join("app/assets/pgns", PGN_FILE.sample))
        pgn = PGN.parse(text, encoding = "UTF-8").first
        title = pgn.tags["Title"]
        white = pgn.tags["White"].split(",").reverse().join(" ")
        black = pgn.tags["Black"].split(",").reverse().join(" ")

        notable = {
            pgn: text,
            event: pgn.tags["Event"],
            site: pgn.tags["Site"],
            white: white,
            wavatar: gmAvatar(white),
            black: black,
            bavatar: gmAvatar(black),
            year: pgn.tags["Date"].split(".")[0],
            title: title ? t("notable.#{title}") : "#{wname} vs. #{bname}"
        }
        return OpenStruct.new(notable)
    end

	def gmAvatar(name)
		notable = Game::NOTABLE.select { |notable| name.include?(notable) }.first
		avatar = "players/#{notable}.png" if notable.present?
		return avatar
	end

end
