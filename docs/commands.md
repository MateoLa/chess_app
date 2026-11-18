## Commands


* Start docker daemon (ubuntu)

```sh
sudo systemctl start docker
sudo systemctl status docker
# Or
systemctl --user start docker-desktop
```

* Start the application

```sh
docker compose up
```

* Update gems

```sh
docker compose run --rm app bundle install
```


#### Shell

* Verify User Groups

```sh
sudo groups <user-name>
```

* Verify your GitHub ssh access

```sh
ssh -T git@github.com
```

* Generate your own fullchain.pem and privkey.pem

```sh
openssl req -x509 -newkey rsa:2048 -keyout privkey.pem -out fullchain.pem -sha256 -days 3650 -nodes -subj "/C=XX/ST=stateName/L=cityName/O=companyName/OU=companySectionName/CN=Hostname"
```

* Use openssl to create a dhparam.pem file.

```sh
sudo openssl dhparam -out /<absolute-path-to-your-app>/dhparam/dhparam-2048.pem 2048
```

* Server time/time-zone commands

```sh
timedatectl list-timezones
timedatectl set-timezone America/Montevideo
timedatectl
date
```

* Reboot your server

```sh
sudo shutdown -r now
```


#### Docker

* Remove Containers, Images and Volumes

```sh
docker rm $(docker ps -a -q)
docker rmi $(docker images -a -q)
docker volume rm $(docker volume ls -q)
docker system prune --volumes
```

* Rebuild Container Image without rebuilding its dependencies

```sh
docker compose up --force-recreate --no-deps <image-name>
docker compose build --no-cache
docker compose run --rm --service-ports web
```

* CertBot commands

```sh
docker compose run --rm --entrypoint="/bin/sh" -it certbot    # Shell access to Certbot container
docker compose run --rm --entrypoint="certbot certificates" -it certbot    # Check Certbot SSL certificates expiration date
docker-compose exec -it certbot renew --quiet    # Force Certbot renew certificates
docker-compose exec -it webserver ls -la /etc/letsencrypt/live    # Check if your credentials were mounted to the web server
```

* Test the CertBot container

```sh
docker compose -f ./docker-compose-nginx-init.yml run --rm  certbot certonly --webroot --staging --agree-tos --no-eff-email --email mlaino@gmail.com -w /var/www/letsencrypt -d your-domain.com -d www.your-domain.com
```

* Check cron logs

```sh
/var/log/cron.log
```

* If the service is up and running you can check the logs with:

```sh
docker compose logs webserver
docker compose logs certbot
```

* Access containers

```sh
docker compose exec -it webserver /bin/sh
docker compose exec -it web /bin/sh
docker compose exec -it postgres bin/sh
docker compose exec postgres psql -U <db-user>    # If the user exists
```


* Install a new gem added to your Gemfile

```sh
docker compose run --rm web bundle install
```

* Update gems even if there is no Gemfile.lock
```sh
docker compose run --rm -e BUNDLE_FROZEN=false app bundle update
```

* Access Rails Console

```sh
docker compose exec -it web bundle exec rails c
```


* Compile your assets

```sh
docker compose exec -it app bundle exec rake assets:clobber
# Locate the assets in Propshaft
docker compose exec -it app bundle exec bin/rails assets:reveal:full
# Rebuild the CSS assets (For dartsass in development after clobber)
docker compose run --rm app bundle exec bin/rails dartsass:build
# Check if Dartsass is watching
docker compose exec web bin/rails dartsass:watch
docker compose exec -it app bundle exec rake assets:precompile RAILS_ENV=production
```sh



* Dealing with your DB

```sh
docker compose exec -it web bundle exec rake db:create
docker compose exec -it web bundle exec rake db:migrate
docker compose exec -it postgres psql -U mbusch
docker compose exec -it web bundle exec rake assets:precompile RAILS_ENV=production
```

```bash
# app is the compose service
docker compose run --rm app bash -c '
  bundle exec rails db:drop &&
  bundle exec rails db:create &&
  bundle exec rails db:migrate &&
  bundle exec rails db:seed'
```

* Check your Routes

```sh
docker compose exec -it app bundle exec rails routes
```

* ERROR: network docker_default has active endpoints

```sh
docker-compose down --remove-orphans
```


#### Rails

* Generate a new rails Master Key

Delete master.key and credentials.yml.enc files in the app config directory.<br>
Comment out your RAILS_MASTER_KEY variable in the .env file.

```sh
rails credentials:edit
```

* Generate a devise secret key

```sh
bundle exec rake secret
```

* Install npm packages:

```sh
docker compose run --rm web npm install @mercadopago/sdk-js
```
(To uninstall: npm uninstall <package_name>)

* Importmap: <br>


* Importmap pin.

```sh
./bin/importmap pin bootstrap --download
docker compose run --rm app bundle exec bin/importmap pin @chrisoakman/chessboard2@0.5.0/dist/chessboard2.min.js --from unpkg
```

Over docker:

```sh
docker compose run --rm web ./bin/importmap pin @mercadopago/sdk-js --download
```

To unpin: `./bin/importmap unpin <package_name>`

When running your server if you get the error: `/usr/bin/env: ‘ruby\r’: No such file or directory` read the [errors doc](./ERRORS.md).

* Importmap test: <br>
(See what you can import)

```sh
docker compose run --rm web ./bin/importmap json
```

* In development branch delete precompiled assets

You are going to work with hot-reloading
```sh
rails assets:clobber
```
This going to delete your public folder.


* content_for & yield

```sh
<html>
  <head>
    <%= yield :page_specific_js %>
  </head>
  <body>
    <%= yield %>
  </body>
</html>

<% content_for :page_specific_js do %>
  -> Insert JS script tag here
<% end %>
```

* Time Zones

```sh
rails time:zones
```


#### Postgresql

```sh
sudo -u postgres psql
\l
drop database mbusch_production;
grant all privileges on database mbusch_production to mbuch;
create user user_name with encrypted password 'mypassword';
alter user user_name createdb;
delete from spree_countries where id not in (225);
\du
```

* sql

```sh
 delete from spree_calculators where id=1;
```

```sh
\l
\db
\c chess_pwa_development
\dt
\d users
select * from users;
```


#### Git

* Deal with git commits

```sh
git rebase -i @~3    # To show the last 3 commits in a text editor
# Change pick to edit, save and close the file
git reset @~    # To discard the last commit, but not the changes to the files.
```

* Verify your GitHub ssh access

```sh
ssh -T git@github.com
```

* Replace remote Tag

```sh
git tag -d <tagname>                  # delete the old tag locally
git push origin :refs/tags/<tagname>  # delete the old tag remotely
git tag <tagname> <commitId>          # make a new tag locally
git push origin <tagname>             # push the new local tag to the remote 
```

* See last commits hash

```sh
git reflog
```


#### Redis within docker

* Access Redis server

```rails
docker compose exec -it redis sh
> redis-cli
127.0.0.1:6379> ping
PONG
```
