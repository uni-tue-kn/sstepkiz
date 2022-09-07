###################################################################################################
#                        Use this script to setup the Aggregator Device.                          #
#                                                                                                 #
#                          Note: You will need to do some manual setup.                           #
#       The exact details are described in sstep-kiz/deployment/aggregator-device/README.md       #
###################################################################################################
#                                          How to use it                                          #
# 1. Copy this file to C:\Aggregator-Device-Setup.ps1                                             #
# 2. Open PowerShell as administrator                                                             #
# 3. Run powershell.exe -NoProfile -ExecutionPolicy bypass -file "C:\Aggregator-Device-Setup.ps1" #
###################################################################################################

#Requires -RunAsAdministrator

# Configuration:
#################

# Path of SSTeP-KiZ Software
$SSTEPKIZ_PATH = "C:\sstep-kiz"
$SSTEPKIZ_REPO = "https://git.bs-wit.de/jop/sstep-kiz.git"


# Remove Windows Apps:
#######################

Get-AppxPackage Microsoft.Microsoft3DViewer | Remove-AppxPackage
Get-AppxPackage Microsoft.GetHelp | Remove-AppxPackage
Get-AppxPackage Microsoft.BingWeather | Remove-AppxPackage
Get-AppxPackage Microsoft.BingNews | Remove-AppxPackage
Get-AppxPackage Microsoft.Getstarted | Remove-AppxPackage
Get-AppxPackage Microsoft.MicrosoftOfficeHub | Remove-AppxPackage
Get-AppxPackage Microsoft.MicrosoftSolitaireCollection | Remove-AppxPackage
Get-AppxPackage Microsoft.MicrosoftStickyNotes | Remove-AppxPackage
Get-AppxPackage Microsoft.MixedReality.Portal | Remove-AppxPackage
Get-AppxPackage Microsoft.MSPaint | Remove-AppxPackage
Get-AppxPackage Microsoft.Office.OneNote | Remove-AppxPackage
Get-AppxPackage Microsoft.People | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsFeedbackHub | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsMaps | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsCalculator | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsSoundRecorder | Remove-AppxPackage
Get-AppxPackage Microsoft.Xbox.TCUI | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxApp | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxGameOverlay | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxSpeechToTextOverlay | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxGamingOverlay | Remove-AppxPackage
Get-AppxPackage Microsoft.YourPhone | Remove-AppxPackage
Get-AppxPackage Microsoft.ZuneMusic | Remove-AppxPackage
Get-AppxPackage Microsoft.ZuneVideo | Remove-AppxPackage
Get-AppxPackage Microsoft.SkypeApp | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsAlarms | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxIdentityProvider | Remove-AppxPackage
Get-AppxPackage Microsoft.WindowsCamera | Remove-AppxPackage
Get-AppxPackage Microsoft.DesktopAppInstaller | Remove-AppxPackage
Get-AppxPackage microsoft.windowscommunicationsapps | Remove-AppxPackage
Get-AppxPackage XINGAG.XING | Remove-AppxPackage
Get-AppxPackage SpotifyAB.SpotifyMusic | Remove-AppxPackage
Get-AppxPackage RealtekSemiconductorCorp.RealtekAudioControl | Remove-AppxPackage
Get-AppxPackage Microsoft.549981C3F5F10 | Remove-AppxPackage # Cortana


# Configure Windows
####################

# Disable USB Devices in Lockscreen
Set-ItemProperty -path HKLM:\SYSTEM\CurrentControlSet\Control\USB\AutomaticSurpriseRemoval -Name AttemptRecoveryFromUsbPowerDrain -Type DWord -Value 0
# Disable Power Throttling
New-Item -Path HKLM:\System\CurrentControlSet\Control\Power\PowerThrottling -Force
Set-ItemProperty -Path HKLM:\System\CurrentControlSet\Control\Power\PowerThrottling -Name PowerThrottlingOff -Type DWord -Value 1
# General: Let apps use my advertising ID: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo -Name Enabled -Type DWord -Value 0
# General: SmartScreen Filter for Store Apps: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppHost -Name EnableWebContentEvaluation -Type DWord -Value 1
# General: Let Apps Access Language List: Disable
#New-Item -Path HKCU:\ControlPanel\International\UserProfile -Name HttpAcceptLanguageOptOut -Type DWord -Value 0
#Set-ItemProperty -Path HKCU:\ControlPanel\International\UserProfile -Name HttpAcceptLanguageOptOut -Type DWord -Value 0
# General: Trace app start: Disable
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced -Name Start_TrackProgs -Type DWord -Value 0
# General: Suggest content in Settings app: Disable
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-338393 -Type DWord -Value 0
# Voice Activation: Disable Online Speech Recognition
Set-ItemProperty -Path HKLM:\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy -Name HasAccepted -Type DWord -Value 0 -Force
# Voice Activation: Disable
New-Item -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Force
Set-ItemProperty -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Name AgentActivationEnabled -Type DWord -Value 0 -Force
Set-ItemProperty -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Name AgentActivationOnLockScreenEnabled -Type DWord -Value 0 -Force
# Inking & Typing Personalization: Get To Know Me
@('RestrictImplicitInkCollection','RestrictImplicitTextCollection') |% { Set-ItemProperty -Path HKLM:\Software\Microsoft\InputPersonalization -Name $_ -Type DWord -Value 1 }
# Disable Telemetry/Diagnosis and Feedback (requires a reboot to take effect)
Set-ItemProperty -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection -Name AllowTelemetry -Type DWord -Value 0
Get-Service DiagTrack,Dmwappushservice | Stop-Service | Set-Service -StartupType Disabled
# Activity Tracking: Disable
@('EnableActivityFeed','PublishUserActivities','UploadUserActivities') |% { Set-ItemProperty -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\System -Name $_ -Type DWord -Value 0 }
# Location: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location -Name Value -Type String -Value Deny -Force
# Camera: Disable App Store access
# Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam -Name Value -Type String -Value Deny -Force
# Microphone: Disable App Store access
# Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone -Name Value -Type String -Value Deny -Force
# Voice Activation: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location -Name Value -Type String -Value Deny -Force
# Notifications: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userNotificationListener -Name Value -Type String -Value Deny -Force
# Account Information: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userAccountInformation -Name Value -Type String -Value Deny -Force
# Contacts: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\contacts -Name Value -Type String -Value Deny -Force
# Calendar: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\appointments -Name Value -Type String -Value Deny -Force
# Telefonanrufe: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\phoneCall -Name Value -Type String -Value Deny -Force
# Anrufliste: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\phoneCallHistory -Name Value -Type String -Value Deny -Force
# Email: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\email -Name Value -Type String -Value Deny -Force
# Tasks: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userDataTasks -Name Value -Type String -Value Deny -Force
# Messaging: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\chat -Name Value -Type String -Value Deny -Force
# Radios (Funktechnik): Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\radios -Name Value -Type String -Value Deny -Force
# BluetoothSync (Weitere Gräte): Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\bluetoothSync -Name Value -Type String -Value Deny -Force
# Background Apps: Disable
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications -Name GlobalUserDisabled -Type DWord -Value 1 -Force
# App Diagnosis: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\appDiagnostics -Name Value -Type String -Value Deny -Force
# Documents: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\documentsLibrary -Name Value -Type String -Value Deny -Force
# Pictures: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\picturesLibrary -Name Value -Type String -Value Deny -Force
# Videos: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\videosLibrary -Name Value -Type String -Value Deny -Force
# File System: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\broadFileSystemAccess -Name Value -Type String -Value Deny -Force
## SafeSearch: Set Safe search to strict(2)
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name SafeSearchMode -Type DWord -Value 2
## Disable Microsoft-Account, Educational-Account and History
@('IsMSACloudSearchEnabled','IsAADCloudSearchEnabled', 'IsDeviceSearchHistoryEnabled') |% { Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name $_ -Type DWord -Value 0 }
# Disable Notifications on Lock-Screen
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings -Name NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK -Type DWord -Value 0
# Disable Notifications of VOIP-Calls on Lock-Screen
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings -Name NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK -Type DWord -Value 0
# Show Windows Welcome Screen
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-310093Enabled -Type DWord -Value 0
# Show Tips and Tricks
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-338389Enabled -Type DWord -Value 0
# Disable Share nearby
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name NearShareChannelUserAuthzPolicy -Type DWord -Value 0
# Disable Share on devices
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name RomeSdkChannelUserAuthzPolicy -Type DWord -Value 0
## Disable Clipboard
Set-ItemProperty -Path HKCU:\Software\Microsoft\Clipboard -Name EnableClipboardHistory -Type DWord -Value 0
## Remote Desktop
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name fDenyTSConnections -Type DWord -Value 1
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name updateRDStatus -Type DWord -Value 0
# Enable Auto Time Sync
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\Parameters -Name Type -Type String -Value NTP
# Automatically Set Time Zone
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\tzautoupdate -Name Start -Type DWord -Value 4
# Enable Touch keyboard if no other keyboard is detected
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\TabletTip\1.7 -Name EnableDesktopModeAutoInvoke -Type DWord -Value 1
# Disable News and Interests
New-Item -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows -Name "Windows Feeds" -Force
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Feeds" -Name EnableFeeds -Type DWord -Value 0 -Force
# Show search icon in taskbar
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Search -Name SearchboxTaskbarMode -Type DWord -Value 1
# Disable Cortana icon in taskbar
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced -Name ShowCortanaButton -Type DWord -Value 0
# Disable "Get more out of Windows" screen
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\UserProfileEngagement -Name ScoobeSystemSettingEnabled -Type DWord -Value 0
# Disable AutoPlay
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers -Name DisableAutoplay -Type DWord -Value 1

# Install dependencies:
########################

# Install Chocolatey
if (!(Test-Path "C:\ProgramData\chocolatey\choco.exe")) {
    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    # Update PATH variable
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Install Git
choco install git -y
# Install Microsoft Visual C++ 2015-2019 Redistributable x64
choco install vcredist140 -y
# Install Visual Studio 2019 Build tools
choco install visualstudio2019buildtools --package-parameters "--allWorkloads --includeRecommended" -y
# Install Python
choco install python -y
# Install OpenJDK 11 (LTS)
choco install openjdk11 -y
# Install Node.js LTS
choco install nodejs-lts -y
# Install Visual Studio Code
choco install vscode -y
# Install Nextcloud
choco install nextcloud-client -y
# Install TeamViewer
choco install teamviewer -y
# Install auto updater
choco install choco-upgrade-all-at-startup -y


# Update PATH variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install latest Node Package Manager (NPM)
npm install --location=global npm@8.18

# This should fix an node-gyp error
# npm install --global --production windows-build-tools --vs2015


# Update Repository
####################

# Clone SSTeP-KiZ Repository
if (!(Test-Path $SSTEPKIZ_PATH)) {
    Set-Location -Path "C:\"
    git clone "$SSTEPKIZ_REPO"
}
# Go to local repository
Set-Location -Path "$SSTEPKIZ_PATH"
# Remove changes
git stash clear
git pull


# Configure apps
#################

# Configure Microsoft Edge
Copy-Item "$SSTEPKIZ_PATH\deployment\aggregator-device\Preferences" -Destination "$Env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"
# Configure bash as NPM console
npm config set script-shell "C:\Program Files\git\bin\bash.exe"

# Configure Auto Git update of SSTeP-KiZ
$taskName = "SSTeP-KiZ-Git-Manager"
$taskExists = Get-ScheduledTask | Where-Object {$_.TaskName -like $taskName}
if ($taskExists) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy bypass -NoExit -File $SSTEPKIZ_PATH\deployment\aggregator-device\SSTeP-KiZ-Git-Manager.ps1"
$trigger = New-ScheduledTaskTrigger -AtStartup -ThrottleLimit 1
$principal = New-ScheduledTaskPrincipal -GroupId "NT-AUTORIT$([char]0x00C4)T\Authentifizierte Benutzer" #-RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -WakeToRun -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Hours 1) -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal


# Configure Sensors
####################

# Trigger a dialogue to create the sensor-configuration.json for the backend
powershell.exe -noprofile -executionpolicy bypass -file "$SSTEPKIZ_PATH/deployment/aggregator-device/Sensor-Config-Dialogue.ps1"

# Update PATH variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")


# Install Aggregator Software
##############################

## Build shared project
Set-Location -Path "$SSTEPKIZ_PATH\shared\"
npm install
npm run build
## Build Aggregator UI
Set-Location -Path "$SSTEPKIZ_PATH\frontends\"
npm install
npm run build:aggregator
## Build Aggregator
Set-Location -Path "$SSTEPKIZ_PATH\backends\"
npm install
npm run build:aggregator

# Create desktop and start menu shortcuts
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($WshShell.SpecialFolders("Desktop") + "\Aggregator.lnk")
$Shortcut.TargetPath = "PowerShell.exe"
$Shortcut.Arguments = "-noprofile -executionpolicy bypass -file $SSTEPKIZ_PATH\deployment\aggregator-device\aggregator.ps1"
$Shortcut.WorkingDirectory = "$SSTEPKIZ_PATH\backends"
$Shortcut.Save()
$Shortcut = $WshShell.CreateShortcut($WshShell.SpecialFolders("AllUsersPrograms") + "\Aggregator.lnk")
$Shortcut.TargetPath = "PowerShell.exe"
$Shortcut.Arguments = "-noprofile -executionpolicy bypass -file $SSTEPKIZ_PATH\deployment\aggregator-device\aggregator.ps1"
$Shortcut.WorkingDirectory = "$SSTEPKIZ_PATH\backends"
$Shortcut.Save()
$Shortcut = $WshShell.CreateShortcut($WshShell.SpecialFolders("AllUsersPrograms") + "\Aggregator Update.lnk")
$Shortcut.TargetPath = "PowerShell.exe"
$Shortcut.Arguments = "-noprofile -executionpolicy bypass -file $SSTEPKIZ_PATH\deployment\aggregator-device\Update.ps1 $SSTEPKIZ_PATH"
$Shortcut.WorkingDirectory = "$SSTEPKIZ_PATH"
$Shortcut.Save()

# Cleanup Start Screen
Import-StartLayout -LayoutPath "$SSTEPKIZ_PATH\deployment\aggregator-device\startscreen.xml" -MountPath $env:SystemDrive\

Write-Host "Setup completed! We recommend to restart the device now"
Write-Host "Press any key to close..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
