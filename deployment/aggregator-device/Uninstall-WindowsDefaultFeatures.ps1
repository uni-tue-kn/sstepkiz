####################################################################################################
#                          Windows Default Features Uninstallation Script                          #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script removes all default features installed by Windows 11.                                #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Uninstall-WindowsDefaultFeatures.ps1" #
####################################################################################################

#Requires -RunAsAdministrator


# Remove Windows Media Player
Disable-WindowsOptionalFeature -FeatureName "WindowsMediaPlayer" -Online

# Remove XPS Services
Disable-WindowsOptionalFeature -FeatureName "Printing-XPSServices-Features" -Online
