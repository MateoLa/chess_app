## Chess PWA 

Rails 8 PWA for playing Chess.


Rails 8 advantages:

  * Solid Storage Trifecta

  Solid Cache for caching (Avoid using Redis) <br>
  Solid Queue for jobs (Avoid Sidekiq or other queuing library) <br>
  Solid Cable for web-sockets (No need of Redis acting as a pub/sub server. With Postgres, MySql or Sqlite acting as message brokers.)

  * Kamal 2 & Thruster

  The dockerfile include Thruster which provide file X-Sendfile acceleration, asset caching and compression. <br>
  (There's no need of Nginx catching o any other web server in front.) <br>
  Kamal for easier deployments includes a proxy: Kamal Proxy which supprt automated SSL certificates via Let's Encrypt. <br>

  Thruster is a lightweight, Go-based HTTP/2 proxy that ships by default in Rails 8 container setups. It runs inside your app container right in front of the Puma web server to handle static file serving, compression, and caching with zero configuration.


PWA advantages:

  Provides a mobile-app-like experience. <br>
  Install your desktop icon and play offline. <br>
  The use of service workers and push notifications enable long-term events like game challenges, tournament warnings, daily game moves and more. <br> 
  [PWAs](./docs/pwa.md) relies on the browser so they provides no OS and no App Store dependencies. <br>   


### Setup

To test the app in a local environment: 

```sh
docker compose up --build
```

Create your own .env file containing these variables:

```sh
DB_USERNAME =
DB_PASSWORD = 
DB_HOST = postgres
```


### Integrations

* Stockfish 

Use the lastes 18.1 Stockfish version.
See the [programatic aspects of integrating Stockfish](./docs/chess.md) in the docs.

* Rails Mobility gem - For stored attributes translations <br >
`gem 'mobility', '~> 1.2'`

```sh
rails generate mobility:install
# you could use --without_tables option to use a different backend
```

* Preferences from scratch - Easyly creating custom preferences for models.

See video [Persistent User Preferences](https://www.youtube.com/watch?v=zT_TDtSL1D8) by Dean DeHart.

Avoid using preferences or preflex gems.<br>
Preflex has bugs. It respond to UserPreference.get("") even when there is no user logged in.

After the user model has been created you can:
```sh
rails g model preferences theme user:references
has_one :preference  # on the user model
belongs_to :user  # on the preference model
```

* Active Storage Validations - validates content-type in avatar model
`gem 'active_storage_validations', '~> 1.3'`


* Gem geocoder + i18n_data

The solution is not good for example in case of user travels to other countries.

```ruby
def checklocale
  I18n.locale = I18nData.country_code(request.location.country)
end
```

* Ahoy & Chartkick

```sh
gem 'ahoy_matey', '~> 5.2'
gem 'groupdate', '~> 6.5'
gem 'chartkick', '~> 5.1'
```

Ahoy for simple analytics for rais.
Chartkick for graphics (With GrouDate for easyly grouping)

* Install Active Storage

```sh
docker compose run --rm web bundle exec bin/rails active_storage:install
docker compose run --rm web bundle exec bin/rails db:migrate
```

Add to your Gemfile `gem 'active_storage_validations', '~> 1.3'`

Needed to attach an User Avatar. See [Avatares](https://github.com/MateoLa/avatares)

* Digital Ocean and LetsEncrypt SSL Certificate

ToDo: This must be updated to Rails 8 use case

### Lichess Chess Games Format

```sh
[Header "..."]

1. e4 { [%eval 0.17] [%clk 0:00:30] } 1... c5 { [%eval 0.19] [%clk 0:00:30] }
2. Nf3 { [%eval 0.25] [%clk 0:00:29] } 2... Nc6 { [%eval 0.33] [%clk 0:00:30] }
```


### Versioning

#### Version 2.0.0 Changes

* Rails 8 instead Rails 7

* Rails 8 Trifecta
Solid Cache, Solid Queue and Solid Cable replacing Redis and Sidekiq

* Rails 8 authentication instead of Devise
`> bin/rails g authentication`

* TailwindCss instead of Bootstrap


### Docs

* [Programmatic Aspects of Chess](./docs/chess.md)

* [PWAs](./docs/pwa.md)

* [Rails docs](./docs/rails.md)

* [Rails Notifications](./docs/rails8-notifications.md)

* [Usefull commands](./docs/commands.md)

* [Action Cable](./docs/action-cable.md)

* [Programing references](./docs/references.md)

* [Digital Ocean and LetsEncrypt SSL Certificate](./docs/letsEncrypt.md)

* [html](./docs/html.md)


### ToDo

* Cropp avatars

### Notes 
[^Nt1]: You need to wait a few minutes before login to the droplet in order to let cloud-init finish its configurations.

[^Nt2]: In Development, if you get the error: bin/dev: 11: exec: foreman: not found --> Change bin/dev to: exec bundle exec foreman start -f Procfile.dev --env /dev/null "$@"

