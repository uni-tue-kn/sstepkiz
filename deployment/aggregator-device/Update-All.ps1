####################################################################################################
#                                          Update Script                                           #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script updates all packages on the Windows 11 device and updates the SSTeP-KiZ Software.    #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Update-All.ps1"                    #
####################################################################################################

param (
  [switch]$force = $false,
  [string]$path = "C:\sstep-kiz",
  [string]$repo = "https://git.bs-wit.de/jop/sstep-kiz.git"
)


# Update packages
winget.exe upgrade --all --silent --force

# Install latest NPM version
npm install --global npm@8.14

# Update SSTeP-KiZ Software
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot/Install-Sstepkiz.ps1 -path $path -repo $repo"
