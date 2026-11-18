### DigitalOcean CI and Certbot SSL Certificates
(This must be updated to Rails 8 use case)


This example shows how to Build and CI an Application over a DigitalOcean Droplet.

Things you may want to cover:

* DigitalOcean Droplet creation script `chessPwa/do-server-setup.sh`

* Application Deployment through GitHub Actions `.github/workflows/do-app-build.yml`

* Database creation

* Database initialization

* App Configuration: CertBot & Crontab `.github/workflows/do-app-ci.yml`

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

#### Certbot Pre-Requisites

You need to point the Domain you want to get SSL certificates for to your new created Droplet. 

### Deployment instructions

#### Droplet Creation

We going to manually create the droplet using DigitalOcean web console.<br>

Configure `do-server-setup.sh` variables: username, directory and repository<br>

At DigitalOcean web console create a new droplet:<br>
* Choose your region, datacenter, image (ubuntu) and CPU.
* In Advanced Options choose "Add initialization scripts". Paste the `do-server-setup.sh` contents in the text area.<br>
* Change the name and add tags to the droplet (Optionall).
* Create it.

Once the server has been created login with the new username and change your password [^Nt1]<br>

#### Deploy the Application

To pull the App from your private repository you need to add the droplet public ssh key to your GitHub account ssh keys.<br>
`cat .ssh/id_rsa.pub`

At GitHub configure the action variables for the repository<br>
Set your secrets at the settings tab:<br>
* DIGITALOCEAN_HOST - The DO droplet IP
* DIGITALOCAN_USER - The DO username you have created 
* DOT_ENV - Add here the whole application .env file (with all its variables)
* SSH_PRIVATE_KEY - Copy here one of the ssh Private keys that belongs to any of the public ssh keys configured at DO for ssh access.

With your setting in place run the Github action `do-docker-ci.yml` to build the Application<br>

Once you have your Certificates in place and Certbot running, you can enable SSL in your Nginx configuration.
This will involve adding an HTTP redirect to HTTPS and specifying your SSL certificate and key locations. It will also involve specifying the Diffie-Hellman group, which you will use for Perfect Forward Secrecy.

* Renewing Certificates

Let’s Encrypt certificates are valid for 90 days. You can set up an automated renewal process to ensure that they do not lapse.<br>
We going to create a cron job to run a script that will renew certificates and reload Nginx configuration.

> chmod +x certbot_renew.sh

#### Deploy Phase 1:

run docker-compose up with the initiation configuration file
obtain a certificate using Certbot and store it in a folder on the host system
run docker-compose down to finish the initiation phase

#### Deploy Phase 2:

create a cron job for renewing the certificate with Certbot and reloading NGINX
run docker-compose up -d with the web-app configuration file

#### Deploy Phase 3: