####################################################################################################
#                                       Aggregator Software                                        #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script runs the Aggregator Software.                                                        #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Run-Aggregator.ps1"                #
####################################################################################################

param (
  [string]$path = "C:\sstep-kiz",
  [string]$logs = "$env:userprofile\sstepkiz\$env:username\logs"
)


# Create logs directory if not exists
if ( !(Test-Path $logs) ) {
  New-Item $logs -ItemType Directory
}

# Start Aggregator Software and pipe output to log file
Set-Location -Path "$path\backends\"
$datetime = Get-Date -format "yyyy_MM_dd_hh_mm_ss"
Write-Output "Das Beenden dieses Fensters beendet die Aggregator Software!"
node.exe ".\dist\apps\aggregator\main.js" *>&1 > "$logs\$datetime.log"
