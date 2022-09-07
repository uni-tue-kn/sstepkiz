#!/bin/bash

# Check for root permissions.
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update packages.
yum update
yum upgrade -y

# Install Docker.
yum update
yum  -y install yum-utils curl
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum update
yum -y install docker-ce docker-ce-cli containerd.io

# Start docker daemon
systemctl start docker

# Install Docker-Compose.
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
