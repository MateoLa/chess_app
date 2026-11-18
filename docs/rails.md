### Time in Rails

```ruby
Time.now.iso8601(3)    # "2025-03-14T23:04:56.872-03:00"

Time.now.to_i    # integer number of seconds since the Epoch

(Time.now.to_f*1000).to_i    # numbero of milliseconds since the Epoch
```

### Inspect Fetch request headers
debug or pry gems binding:
```sh
request.headers["Content-Type"]
request.headers["X-CSRF-Token"]
request.headers.to_h
```

### Instance and Class variables in Rails

```ruby
class A
  # self here returns class A
  @variable = 'class instance variable'
  @@variable = 'class variable'

  def initalize
    # self here returns the instance
    @variable = 'instance variable'
  end

  def self.test_me
    # self here returns class A
    @variable
  end

  def test_me
    # self returns the instance
    @variable
  end

  #class variable is accessible by both class and instance 
  def test_me2
    @@variable
  end

  def self.test_me2
    @@variable
  end
end

A.test_me       #=> 'class instance variable'
A.new.test_me   #=> 'instance variable'
A.test_me2      #=> 'class variable'
A.new.test_me2  #=> 'class variable'
```

### Delete rails assets cache

* Rails Cache

```sh
Rails.cache.clear
docker compose exec -it app bundle exec Rails.cache.clear
```

* Rails Assets Cache

```ruby
rake assets:clobber
```

#### Toggle development caching by running

```ruby
rails dev:cache
```

This command creates "caching-dev.txt" file in "tmp" directory.

From Rails 8 and up Solid Cache is used (not Redis).

#### Generate a new Secret key

```sh
rake secret
```

```ruby
# where sessions willl be stored
Rails.application.config.session_store :redis_cache_store, key: ENV.fetch("SECRET_TOKEN")
# If key is included you don't need to use config/initializers/secret_token.rb 
```

config/initializers/secret_token.rb:
```ruby
# Verify sessions to prevent tampering with this key
Rails.application.config.secret_token = ENV.fetch("SECRET_TOKEN") {}
```

#### Turbo for Models

```ruby
# Model:
after_create_commit { broadcast_append_to 'rooms' }
# View:
<%= turbo_stream_from "rooms" %>
<div id="rooms" data-controller="room-list">
  <%= render "rooms/rooms", rooms: @rooms %>
</div>
```

#### Cache with Redis

Gemfile:
```sh
gem redis
```

docker-compose.yml:
```sh
  redis:
    container_name: redis
    build:
      context: ./redis
      dockerfile: Dockerfile
    volumes:
      - redis:/data
    networks:
      - app-network
```

In ./redis directory you going to have at least this two files: "redis.config" and "Dockerfile"

Verify Redis over a running container because the Redis server must be started.
```sh
docker compose exec -it redis redis-cli
```

```ruby
127.0.0.1:6379> SET mykey "Hello\nWorld"
OK
127.0.0.1:6379> GET mykey
Hello
World
127.0.0.1:6379> keys *
(empty array)
```

#### Console

* display all session content:
```sh
session.to_hash
```


#### Devise Guests gem

Providing track of guest users games.

```sh
gem 'devise-guests', '~> 0.8.3'    # Gemfile
docker compose run --rm app bundle install
docker compose run --rm app bundle exec rails g devise_guests User
```

We try this gem but it creates a lot of guest_users in the DB that you need to occasionally delete. <br>

Delete them manually:
```sh
docker compose exec -it web rake devise_guests:delete_old_guest_users[0,1000]
```

Or add to your server cron:
```sh
0 2 * * * cd /path/to/your/app && /path/to/rake devise_guests:delete_old_guest_users[7] RAILS_ENV=your_env
```
This cron entry example attempts to delete users older than 7 days at 2:00 AM every day

/lib/rake/devise_guest.rb:
```sh
namespace :devise_guests do
  # Task to clean guest users
  # Cron entry example to delete users older than 7 days at 2:00 AM every day:
  # 0 2 * * * cd /path/to/your/app && /path/to/rake devise_guests:delete_old_guest_users[7] RAILS_ENV=your_env
  desc "Removes entries in the users table for guest users that are older than the number of days given."
  task :delete_old_guest_users, [:days_old, :batch_size] => [:environment] do |t, args|
    args.with_defaults(days_old: 7, batch_size: 1000)
    User
      .where("guest = ? and updated_at < ?", true, Time.now - args[:days_old].to_i.days)
      .find_each(batch_size: args[:batch_size].to_i, &:destroy)
  end
end
```

#### Rails 8 Solid Trifecta

```ruby
docker compose run --rm app bundle exec rails g solid_queue:install
docker compose run --rm app bundle exec rails g solid_cache:install
docker compose run --rm app bundle exec rails g solid_cable:install
```

