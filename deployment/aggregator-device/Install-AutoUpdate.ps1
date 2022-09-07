####################################################################################################
#                                 Auto Update Installation Script                                  #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script sets up an auto updater for all installed packages.                                  #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Make sure that the AutoUpdate.xml file is placed in the same folder as this script.           #
# 2. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Install-AutoUpdate.ps1"            #
####################################################################################################

#Requires -RunAsAdministrator

$WshShell = New-Object -ComObject WScript.Shell

$Shortcut = $WshShell.CreateShortcut("$([io.path]::GetFullPath($env:AllUsersProfile))\Microsoft\Windows\Start Menu\Programs\Startup\Update-All.lnk")
$Shortcut.TargetPath = "PowerShell.exe"
$Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Update-All.ps1"
$Shortcut.Save()

# $taskName = "AutoUpdate"
# if (Get-ScheduledTask | Where-Object {$_.TaskName -like $taskName}) {
#   Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
# }
# $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Update-All.ps1"
# $trigger = New-ScheduledTaskTrigger -AtStartup -ThrottleLimit 1
# $user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
# $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Highest
# $settings = New-ScheduledTaskSettingsSet -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)
# Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
