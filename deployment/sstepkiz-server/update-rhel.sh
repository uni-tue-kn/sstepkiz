#!/bin/bash

# Check for root permissions.
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update packages.
yum update
yum upgrade -y

# Pull latest master release
git pull

# Rebuild the whole infrastructure.
docker-compose up -d --build
