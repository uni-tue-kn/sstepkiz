#######################################################################################################################
#                           Use this script to setup a User Account on Aggregator Device.                             #
#                                                                                                                     #
#                                    Note: You will need to do some manual setup.                                     #
#                 The exact details are described in sstep-kiz/deployment/aggregator-device/README.md                 #
#######################################################################################################################
#                                          How to use it                                                              #
# 1. Copy this file to C:\Aggregator-Device-Setup.ps1                                                                 #
# 2. Open PowerShell as user                                                                                          #
# 3. Run powershell.exe -NoProfile -ExecutionPolicy bypass -file "C:\sstep-kiz\deployment\Aggregator-User-Setup.ps1"  #
#######################################################################################################################


# Configuration:
#################

# Path of SSTeP-KiZ Software
$SSTEPKIZ_PATH = "C:\sstep-kiz"
$SSTEPKIZ_REPO = "https://git.bs-wit.de/jop/sstep-kiz.git"


# Remove Windows Apps:
#######################

# Get-AppxPackage Microsoft.Microsoft3DViewer | Remove-AppxPackage
# Get-AppxPackage Microsoft.GetHelp | Remove-AppxPackage
# Get-AppxPackage Microsoft.BingWeather | Remove-AppxPackage
# Get-AppxPackage Microsoft.BingNews | Remove-AppxPackage
# Get-AppxPackage Microsoft.Getstarted | Remove-AppxPackage
# Get-AppxPackage Microsoft.MicrosoftOfficeHub | Remove-AppxPackage
# Get-AppxPackage Microsoft.MicrosoftSolitaireCollection | Remove-AppxPackage
# Get-AppxPackage Microsoft.MicrosoftStickyNotes | Remove-AppxPackage
# Get-AppxPackage Microsoft.MixedReality.Portal | Remove-AppxPackage
# Get-AppxPackage Microsoft.MSPaint | Remove-AppxPackage
# Get-AppxPackage Microsoft.Office.OneNote | Remove-AppxPackage
# Get-AppxPackage Microsoft.People | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsFeedbackHub | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsMaps | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsCalculator | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsSoundRecorder | Remove-AppxPackage
# Get-AppxPackage Microsoft.Xbox.TCUI | Remove-AppxPackage
# Get-AppxPackage Microsoft.XboxApp | Remove-AppxPackage
# Get-AppxPackage Microsoft.XboxGameOverlay | Remove-AppxPackage
# Get-AppxPackage Microsoft.XboxSpeechToTextOverlay | Remove-AppxPackage
# Get-AppxPackage Microsoft.YourPhone | Remove-AppxPackage
# Get-AppxPackage Microsoft.ZuneMusic | Remove-AppxPackage
# Get-AppxPackage Microsoft.ZuneVideo | Remove-AppxPackage
# Get-AppxPackage Microsoft.SkypeApp | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsAlarms | Remove-AppxPackage
# Get-AppxPackage Microsoft.XboxIdentityProvider | Remove-AppxPackage
# Get-AppxPackage Microsoft.WindowsCamera | Remove-AppxPackage
# Get-AppxPackage Microsoft.DesktopAppInstaller | Remove-AppxPackage
# Get-AppxPackage microsoft.windowscommunicationsapps | Remove-AppxPackage
# Get-AppxPackage XINGAG.XING | Remove-AppxPackage
# Get-AppxPackage SpotifyAB.SpotifyMusic | Remove-AppxPackage
# Get-AppxPackage RealtekSemiconductorCorp.RealtekAudioControl | Remove-AppxPackage
# Get-AppxPackage Microsoft.549981C3F5F10 | Remove-AppxPackage # Cortana

# Configure Windows
####################

# # General: Trace app start: Disable
# Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced -Name Start_TrackProgs -Type DWord -Value 0
# # General: Suggest content in Settings app: Disable
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-338393 -Type DWord -Value 0
# # Voice Activation: Disable Online Speech Recognition
# Set-ItemProperty -Path HKLM:\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy -Name HasAccepted -Type DWord -Value 0
# # Voice Activation: Disable
# New-Item -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Force
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Name AgentActivationEnabled -Type DWord -Value 0 -Force
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps -Name AgentActivationOnLockScreenEnabled -Type DWord -Value 0 -Force
# # Background Apps: Disable
# Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications -Name GlobalUserDisabled -Type DWord -Value 1 -Force
# ## SafeSearch: Set Safe search to strict(2)
# Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name SafeSearchMode -Type DWord -Value 2
# ## Disable Microsoft-Account, Educational-Account and History
# @('IsMSACloudSearchEnabled','IsAADCloudSearchEnabled', 'IsDeviceSearchHistoryEnabled') |% { Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name $_ -Type DWord -Value 0 }
# # Show Windows Welcome Screen
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-310093Enabled -Type DWord -Value 0
# # Show Tips and Tricks
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-338389Enabled -Type DWord -Value 0
# # Disable Share nearby
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name NearShareChannelUserAuthzPolicy -Type DWord -Value 0
# # Disable Share on devices
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name RomeSdkChannelUserAuthzPolicy -Type DWord -Value 0
# ## Disable Clipboard
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Clipboard -Name EnableClipboardHistory -Type DWord -Value 0
# # Show search icon in taskbar
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Search -Name SearchboxTaskbarMode -Type DWord -Value 1
# # Disable Cortana icon in taskbar
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced -Name ShowCortanaButton -Type DWord -Value 0
# # Disable "Get more out of Windows" screen
# Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\UserProfileEngagement -Name ScoobeSystemSettingEnabled -Type DWord -Value 0
# # Disable AutoPlay
# Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers -Name DisableAutoplay -Type DWord -Value 1


# Install Software
###################

# # Update NPM
# npm install --location=global npm@8.18


# Configure apps
#################

# # Configure Microsoft Edge
# Copy-Item "$SSTEPKIZ_PATH\deployment\aggregator-device\Preferences" -Destination "$Env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"
# # Configure bash as NPM console
# npm config set script-shell "C:\Program Files\git\bin\bash.exe"


# Configure Sensors
####################

# # Trigger a dialogue to create the sensor-configuration.json for the backend
# powershell.exe -noprofile -executionpolicy bypass -file "$SSTEPKIZ_PATH/deployment/aggregator-device/Sensor-Config-Dialogue.ps1" $SSTEPKIZ_PATH

# # Update PATH variable
# $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")


# Install Aggregator Software
##############################

# # Create desktop shortcut
# $WshShell = New-Object -ComObject WScript.Shell
# $Shortcut = $WshShell.CreateShortcut($WshShell.SpecialFolders("Desktop") + "\Aggregator.lnk")
# $Shortcut.TargetPath = "PowerShell.exe"
# $Shortcut.Arguments = "-noprofile -executionpolicy bypass -file $SSTEPKIZ_PATH\deployment\aggregator-device\aggregator.ps1"
# $Shortcut.WorkingDirectory = "$SSTEPKIZ_PATH\backends"
# $Shortcut.Save()

# Write-Host "Setup completed! We recommend to restart the device now"
# Write-Host "Press any key to close..."
# $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
