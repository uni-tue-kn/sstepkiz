# SSteP-KiZ Server

## 1. Requirements

You need a virtual machine (recommended) or server on which you have root access to.
This system requires also the following properties:

- Linux based OS (tested on Debian 10 and CentOS 8)
- 1 public IP address the system is accessible through (1 IPv4 and 1 IPv6 address recommended)
- 1 (v)Core (2 or more recommended)
- 1 GB RAM (4 or more recommended)
- 20 GB HDD/SSD space

## 2. Deployment

### 2.1. Clone repository

If not yet done, you need to install Git using one of the following commands, depending on your Linux distribution:

```bash
# Debian based distributions such as Ubuntu:
$ sudo apt-get -y install git

# RHEL based distributions such as CentOS:
$ sudo yum -y install git
```

Clone the repository to your preferred directory, e.g., `/var/sstep-kiz`, using the following command:

```bash
/var$ git clone https://git.bs-wit.de/jop/sstep-kiz.git
```

### 2.2. Install dependencies

Navigate to the repository's directory `/deployment/sstepkiz-server` and run the setup script using one of the following commands, depending on your Linux distribution:

```bash
# Debian based distributions such as Ubuntu:
/var/sstep-kiz/deployment/sstepkiz-server$ ./setup-debian.sh

# RHEL based distributions such as CentOS:
/var/sstep-kiz/deployment/sstepkiz-server$ ./setup-rhel.sh
```

This will install all the necessary dependencies such as Docker or Docker Compose.

### 2.3. Configure Environment

Then go to the `/deployment/sstepkiz-server/.env` file and adjust the environment variables:

```bash
# Domain of SSteP-KiZ Admin UI.
ADMIN_DOMAIN=admin.example.org

# Domain of IMeRa Server.
IMERA_DOMAIN=imera.example.org

# Domain of Patient UI.
PATIENT_DOMAIN=patient.example.org

# Domain of Signalling Server.
SIGNALLING_DOMAIN=signalling.example.org

# Domain of Therapist UI.
THERAPIST_DOMAIN=therapist.example.org

# Domain of STUN/TURN Server.
TURN_DOMAIN=turn.example.org

# SSteP-KiZ realm of SSO.
SSO_ISSUER=https://sso.example.org/auth/realms/sstepkiz

# Email address for notifications of expiring TLS certificates.
TLS_EMAIL=letsencrypt@example.org

# IP address range of DMZ to restrict internal services to.
DMZ_RANGE=134.2.0.0/16

# Port of HTTP services (should stay default port 80).
HTTP_PORT=80

# Port of HTTPS services (should stay default port 443).
HTTPS_PORT=443

# Port of STUN server (should stay default port 4378).
STUN_PORT=3478

# Port of STUNS server (should stay default port 5349).
STUNS_PORT=5349

# Dynamic TURN port range.
TURN_MIN_PORT=49160
TURN_MAX_PORT=49200

# Directory to store secrets in.
SECRETS_DIR=.secrets
```

The dynamic TURN port range should be twice the number of patients.

### 2.4. Setup DNS

Contact your DNS provider and link your preferred (sub-)domains to your server's IP address.

It is recommended to create one special (sub-)domain (e.g., `sstepkizmachine.example.org`) with an A and AAAA record to the IPv4 and IPv6 addresses of the server's IP address and additional (sub-)domains (e.g., `patient.example.org`, `therapist.example.org`, ...) with a CNAME record to the server's (sub-)domain.

### 2.5. Download SSO's public key

To validate the OAuth Access Tokens, the server applications require the SSO's public key in PEM format.
To get the public key and store it into a `.pem` file, execute the following command:

```bash
/deployment/sstepkiz-server$ ./download-public-key.sh <sso-issuer> <secrets-directory>
```

If it does not yet exist, this will create the directory specified in `SECRETS_DIR` variable of the `.env` file.
Into this directory, the file `sso_public_key.pem` will be generated containing the downloaded public key of the SSO.
Docker Compose will use them later to run the services.

### 2.6. Generate secrets

Next you need to generate secret files containing the database's credentials.

Therefore run the following command:

```bash
/var/sstep-kiz/deployment/sstepkiz-server$ ./generate-secrets.sh <secrects-directory>
```

If it does not yet exist, this will create the directory specified in `SECRETS_DIR` variable of the `.env` file.
Into this directory, randomly generated credentials for the database will be written into separate `.txt` files, if they to not yet exist.
Docker Compose will use them later to setup the database and to run the services.

**Do not share these files or commit them to Git!**
**These files contain confidential information!**

You should also consider to add this directory to your backup.
**If so, it is strongly recommended encrypt your backup!**

### 2.7. Start service composition

To start all the services as a composition, execute the following command:

```bash
/var/sstep-kiz/deployment/sstepkiz-server$ docker-compose up -d
```

This will run the whole composition in background.

## 3. Logging

The used JSON File logging driver will log the files to `/var/lib/docker/containers/[container_id]/[container_id]-json.log` where `[container_id]` is a generated ID by the docker system.

Logs can be looked up with one of the following commands:

```bash
# Reverse Proxy
$ docker logs sstepkiz-server_proxy_1

# Database
$ docker logs sstepkiz-server_db_1

# Signalling Server
$ docker logs sstepkiz-server_signalling_1

# Gamification Server
$ docker logs sstepkiz-server_gamification_1

# STUN/TURN Server
$ docker logs sstepkiz-server_turn_1

# Admin UI Server
$ docker logs sstepkiz-server_admin_1

# Patient UI Server
$ docker logs sstepkiz-server_patient_1

# Therapist UI Server
$ docker logs sstepkiz-server_therapist_1
```

## 4. Backup

This section describes which databases and files to backup.

### 4.1. Backup Database

The following command dumps the database to a single SQL file.

```bash
$ docker exec -t DB_CONTAINER_NAME pg_dumpall -c -U `cat DB_USERNAME_SECRET_PATH` > BACKUP_DIR/dump_`date +%Y-%m-%d"_"%H_%M_%S`.sql
```

- `DB_CONTAINER_NAME` is the name of the database container.
- `DB_USERNAME_SECRET_PATH` is the file path of the secret `.txt` file which contains the username of the database.
- `BACKUP_DIR` is the directory where the backup is being stored to.

This process should be automated using command `crontab -e` and adding the following line.

```bash
0 1 * * * docker exec -t DB_CONTAINER_NAME pg_dumpall -c -U `cat DB_USERNAME_SECRET_PATH` > BACKUP_DIR/dump_`date +%Y-%m-%d"_"%H_%M_%S`.sql
```

**Remember to replace placeholder values!**

### 4.2. File Backup

**Do not backup volumes of databases since database may be active while backing up these files!**

The only other persistent data are

- Let's Encrypt Certificates (can be easily re-generated)
- Diffie-Hellman Key for TURN server (can be easily re-generated)

**Do not backup these volumes, since they can be re-generated and leaking those data will lead to security-issues!**

## 5. Updates

Updates on the SSteP-KiZ Server can be installed using one of the following commands, depending on your Linux distribution:

```bash
# Debian based distributions such as Ubuntu:
/var/sstep-kiz/deployment/sstepkiz-server$ sudo ./update-debian.sh

# RHEL based distributions such as CentOS:
/var/sstep-kiz/deployment/sstepkiz-server$ ./update-rhel.sh
```

These update scripts will update all the installed packages using the system's default package manager and will also rebuild all the SSteP-KiZ services.

### 5.1. Update automation

Updates can be installed automatically by regularly running the update scripts with tools like [crontab](https://linux.die.net/man/5/crontab).

With crontab this can be done using one of the following commands, depending on your Linux distribution:

```bash
# Debian based distributions such as Ubuntu: 
$ sudo echo "0 2 * * * root /var/sstep-kiz/deployment/sstepkiz-server/update-debian.sh" >> /etc/crontab

# RHEL based distributions such as CentOS:
$ sudo echo "0 2 * * * root /var/sstep-kiz/deployment/sstepkiz-server/update-rhel.sh" >> /etc/crontab
```

This will execute the update script every day at 2:00 am.
