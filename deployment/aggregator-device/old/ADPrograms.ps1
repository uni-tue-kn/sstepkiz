###########################
### Download Choclatey ####
###########################
if (!(Test-Path "C:\ProgramData\chocolatey\choco.exe")) {
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

##############################
###  Remove Apps Unwanted ####
##############################

get-appxpackage Microsoft.Microsoft3DViewer | remove-appxpackage
get-appxpackage Microsoft.GetHelp | remove-appxpackage
get-appxpackage Microsoft.BingWeather | remove-appxpackage
get-appxpackage Microsoft.Getstarted | remove-appxpackage
get-appxpackage Microsoft.MicrosoftOfficeHub | remove-appxpackage
get-appxpackage Microsoft.MicrosoftSolitaireCollection | remove-appxpackage
get-appxpackage Microsoft.MicrosoftStickyNotes | remove-appxpackage
get-appxpackage Microsoft.MixedReality.Portal | remove-appxpackage
get-appxpackage Microsoft.MSPaint | remove-appxpackage
get-appxpackage Microsoft.Office.OneNote | remove-appxpackage
get-appxpackage Microsoft.People | remove-appxpackage
get-appxpackage Microsoft.WindowsFeedbackHub | remove-appxpackage
get-appxpackage Microsoft.WindowsMaps | remove-appxpackage
get-appxpackage Microsoft.WindowsCalculator | remove-appxpackage
get-appxpackage Microsoft.WindowsSoundRecorder | remove-appxpackage
get-appxpackage Microsoft.Xbox.TCUI | remove-appxpackage
get-appxpackage Microsoft.XboxApp | remove-appxpackage
get-appxpackage Microsoft.XboxGameOverlay | remove-appxpackage
get-appxpackage Microsoft.XboxSpeechToTextOverlay | remove-appxpackage
get-appxpackage Microsoft.YourPhone | remove-appxpackage
get-appxpackage Microsoft.ZuneMusic | remove-appxpackage
get-appxpackage Microsoft.ZuneVideo | remove-appxpackage
get-appxpackage Microsoft.SkypeApp | remove-appxpackage
get-appxpackage Microsoft.XboxGamingOverlay | remove-appxpackage
get-appxpackage Microsoft.WindowsAlarms | remove-appxpackage
get-appxpackage Microsoft.XboxIdentityProvider | remove-appxpackage
get-appxpackage Microsoft.WindowsCamera | remove-appxpackage
get-appxpackage Microsoft.DesktopAppInstaller | remove-appxpackage
get-appxpackage microsoft.windowscommunicationsapps | remove-appxpackage
get-appxpackage XINGAG.XING | remove-appxpackage
get-appxpackage SpotifyAB.SpotifyMusic | remove-appxpackage


##########################
### Download Programs ####
##########################

# Install Microsoft Visual C++ 2015-2019 Redistributable x64
choco install vcredist140 -y

# Install Visual Studio 2019 Build tools
choco install visualstudio2019buildtools --package-parameters "--allWorkloads --includeRecommended" -y
# choco install visualstudio2019community -y

# Install Python
choco install python -y

# Install OpenJDK 11 (LTS)
choco install openjdk11 -y

# Install Latest JRE 8
# choco install jre8 -y

# Install Node.js LTS
choco install nodejs-lts -y

# Install Microsoft Edge
choco install microsoft-edge -y

# Install Visual Studio Code
choco install vscode -y

# Install Nextcloud
choco install nextcloud-client -y

# Install TeamViewer
choco install teamviewer -y

#############################
### Change Edge Settings ####
#############################

# Replace Edge Settings File
Copy-Item "C:\\sstep-kiz\deployment\aggregator-device\Preferences" -Destination "$Env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"

########################
### Update Programs ####
########################

# Install a task to update all packages installed by choclatey on update
choco install choco-upgrade-all-at-startup -y

##############################################################################
### Schedule Task to check for and install updates on the SSTeP-KiZ Repo  ####
##############################################################################

# Check if the Scheduled Task exists
$taskName = "SSTeP-KiZ-Git-Manager"
$taskExists = Get-ScheduledTask | Where-Object {$_.TaskName -like $taskName}

# Remove the old task
if ($taskExists) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the new task
$action = New-ScheduledTaskAction -Execute "C:\Windows\system32\WindowsPowerShell\v1.0\powershell.exe" -Argument "-NoProfile -ExecutionPolicy bypass -NoExit -File C:\sstep-kiz\deployment\aggregator-device\SSTeP-KiZ-Git-Manager.ps1"
$trigger = New-ScheduledTaskTrigger -AtStartup -ThrottleLimit 1
$principal = New-ScheduledTaskPrincipal -GroupId "NT-AUTORIT$([char]0x00C4)T\Authentifizierte Benutzer" #-RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal
