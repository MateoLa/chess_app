Rails.application.routes.draw do
	# Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

	# Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
	# Can be used by load balancers and uptime monitors to verify that the app is live.
	get "up" => "rails/health#show", as: :rails_health_check

	# Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
	get "manifest" => "pwa#manifest", as: :pwa_manifest
	get "service-worker" => "pwa#service_worker", as: :pwa_service_worker

	# Defines the root path route ("/")

	# Mount Mission Control Job's engine where you wish to have it accessible from your app.
	# mount MissionControl::Jobs::Engine, at: "/jobs"

	root "pages#home"
	get "pages/offline", to: "pages#offline"

	devise_for :users, controllers: {
		sessions: "users/sessions",
		passwords: "users/passwords",
		registrations: "users/registrations"
	}

	#  get 'user/:id', to: 'users#show', as: 'user'
	resources :users, only: :show do
		get '/games' => "users#games"
	end

	get "games/anonymous", to: "games#anonymous", as: :anonymous_game
	get "games/:id/play", to: "games#play", as: :play_game
	post "games/vsbot", to: "games#vsbot", as: :vsbot_game
	get "games/vsbot", to: "games#bot", as: :bot_game
	resources :games
	post "games/pairing", to: "games#pairing"
	get "games/:id/challenge", to: "games#challenge", as: :challenge_game
	get "game/analyzer", to: "games#analyzer"
	get "game/design", to: "games#design"
	post "game/play", to: "games#play"

	get 'stockfish/:file', to: "pwa#stockfish"
  
	resource :settings, only: [:show, :update]

	resource :addresses
	namespace :account do 
		resource :profile, controller: :profile, only: [:edit, :update]
		resources :addresses, only: [:index]
	end

	resources :rooms do
		resources :messages
		collection do
    		post :search
		end
	end
	get 'call', to: 'call#user', as: 'call_user'
	post 'call', to: 'call#create'
	get 'rooms/leave/:id', to: 'rooms#leave', as: 'leave_room'    # leave_room_path(room)
	get 'rooms/join/:id', to: 'rooms#join', as: 'join_room'    # join_room_path(room)


	namespace :admin do
		get 'dashboard', only: :show
		resources "games"
		resources "users", only: :index
		resources "variants"
		get 'rooms'
		get 'messages'
#    	get 'admin/games'
#    	get 'admin/variants'
		get 'message/:id', to: 'admin#show_message', as: 'admin_message'
	end
end
