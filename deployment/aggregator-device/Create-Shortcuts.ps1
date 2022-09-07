####################################################################################################
#                                     Shortcut Creation Script                                     #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script creates shortcuts of the Aggregator Software and Aggregator Updater on Desktop and   #
# in Programs List. Both for all users or only current user.                                       #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Create-Shortcuts.ps1"             #
####################################################################################################

param (
  [string]$path = "C:\sstep-kiz",
  [string]$logs = "$env:userprofile\sstepkiz\$env:username\logs",
  [switch]$desktop = $false,
  [switch]$programs = $false,
  [switch]$allUsersDesktop = $false,
  [switch]$allUsersPrograms = $false,
  [switch]$desktopUpdate = $false,
  [switch]$programsUpdate = $false,
  [switch]$allUsersDesktopUpdate = $false,
  [switch]$allUsersProgramsUpdate = $false,
  [switch]$allUsersSoftwareUpdate = $true
)


$WshShell = New-Object -ComObject WScript.Shell

if ( $desktop ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("Desktop"))\Aggregator.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Run-Aggregator.ps1 --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $programs ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("Programs"))\Aggregator.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Run-Aggregator.ps1 --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $allUsersDesktop ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("AllUsersDesktop"))\Aggregator.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Run-Aggregator.ps1 --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $allUsersPrograms ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("AllUsersPrograms"))\Aggregator.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Run-Aggregator.ps1 --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $desktopUpdate ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("Desktop"))\Aggregator Update.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Install-Sstepkiz.ps1 --force --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $programsUpdate ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("Programs"))\Aggregator Update.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Install-Sstepkiz.ps1 --force --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $allUsersDesktopUpdate ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("AllUsersDesktop"))\Aggregator Update.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Install-Sstepkiz.ps1 --force --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $allUsersProgramsUpdate ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("AllUsersPrograms"))\Aggregator Update.lnk")
  $Shortcut.TargetPath = "PowerShell.exe"
  $Shortcut.Arguments = "-NoProfile -ExecutionPolicy bypass -File $PSScriptRoot\Install-Sstepkiz.ps1 --force --path $path --logs $logs"
  $Shortcut.Save()
}

if ( $allUsersSoftwareUpdate ) {
  $Shortcut = $WshShell.CreateShortcut("$($WshShell.SpecialFolders("AllUsersPrograms"))\Software Update.lnk")
  $Shortcut.TargetPath = "winget.exe"
  $Shortcut.Arguments = "upgrade --all --force"
  $Shortcut.Save()
}
