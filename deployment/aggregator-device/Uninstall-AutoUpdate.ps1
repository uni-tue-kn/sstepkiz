####################################################################################################
#                                Auto Update Uninstallation Script                                 #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script removes an auto updater for all installed packages.                                  #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Uninstall-AutoUpdate.ps1"          #
####################################################################################################

#Requires -RunAsAdministrator

Remove-Item "$([io.path]::GetFullPath($env:AllUsersProfile))\Microsoft\Windows\Start Menu\Programs\Startup\Update-All.lnk"

# schtasks.exe /DELETE /F /TN "AutoUpdate"
