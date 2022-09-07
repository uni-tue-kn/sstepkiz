####################################################################################################
#                                  Aggregator Device Setup Script                                  #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script installs the Aggregator Device.                                                      #
# This includes cleanup of the Windows 11 setup, installation of all required packages and the     #
# SSTeP-KiZ Aggregator Software.                                                                   #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Install-Aggregator-Device.ps1"     #
####################################################################################################

#Requires -RunAsAdministrator


# Uninstall not required Windows default Apps
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Uninstall-WindowsDefaultFeatures.ps1"

# Uninstall not required Windows default Apps
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Uninstall-WindowsDefaultApps.ps1"

# Install required packages
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Install-Packages.ps1"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install SSTeP-KiZ software
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Install-Sstepkiz.ps1" --force

# Install SSTeP-KiZ Shortcuts
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Create-Shortcuts.ps1" --allUsersPrograms --allUsersProgramsUpdate

# Configure device
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Configure-Windows-Device.ps1"

# Configure user
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Configure-Windows-User.ps1"

# Install Auto Updater
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot\Install-AutoUpdate.ps1"
