####################################################################################################
#                                  Aggregator Device Setup Script                                  #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script installs the Aggregator User. It MUST be called once per user setup.                 #
# This includes cleanup of default Windows Apps and configuration of the SSTeP-KiZ Aggregator      #
# Software.                                                                                        #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Make sure that the AutoUpdate.xml file is placed in the same folder as this script.           #
# 2. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Install-Aggregator-Device.ps1"     #
####################################################################################################


# Uninstall not required default Windows Apps
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot/Uninstall-WindowsDefaultApps.ps1"

# Install SSTeP-KiZ Shortcut on Desktop
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot/Create-Shortcuts.ps1" --desktop

# Configure user
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot/Configure-Windows-User.ps1"

# Configure sensors
PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "$PSScriptRoot/Configure-Sensors.ps1"
