####################################################################################################
#                                    Remote Installation Script                                    #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script downloads the SSTeP-KiZ Software and installs the Aggregator Device.                 #
# If you have already downloaded the SSTeP-KiZ repository, use the Install-Aggregator-Device.ps1   #
# script. This script is meant for a one-command-deployment directly from the internet.            #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Easy-Install.ps1"                  #
####################################################################################################

#Requires -RunAsAdministrator


$path = "C:\sstep-kiz"

# Install Git
winget.exe install --exact --silent --id Git.Git

# Update PATH variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Download source code from SSTeP-KiZ Repo.
git.exe clone "https://git.bs-wit.de/jop/sstep-kiz.git" "$path"

# Install Aggregator Device
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$path\deployment\aggregator-device\Install-Aggregator-Device.ps1"
