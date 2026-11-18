class GuestPreferenceService
    PREFERENCE_KEYS = [:theme, :locale, :mode, :variant_id, :level, :board_theme, :piece_theme].freeze

    def self.update_guest_preference(cookies, preferences)
        preferences.each do |key, value|
            cookies.permanent[key] = value
        end
    end

    def self.guest_preferences_present?(cookies)
        PREFERENCE_KEYS.any? { |key| cookies[key].present? }
    end

    def self.transfer_preferences_to_user(cookies, user)
        PREFERENCE_KEYS.each do |key|
            user.create_preference({key => cookies[key]}) if cookies[key].present?
            cookies.delete(key)
        end
        user.save!
    end
end