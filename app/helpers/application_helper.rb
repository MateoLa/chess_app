module ApplicationHelper
    def search_user
        if params.dig(:user_search).present? && params.dig(:user_search).length > 2
            User.all_except(current_user)
                .where('username ILIKE ?', "%#{params.dig(:user_search)}%")
                .order(name: :asc)
        else
            []
        end
    end
end
