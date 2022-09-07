####################################################################################################
#                               Windows Device Configuration Script                                #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script configures the whole Windows 11 device.                                              #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Configure-Windows-Device.ps1"      #
####################################################################################################

#Requires -RunAsAdministrator


# Configure bash as NPM console
npm config set script-shell "C:\Program Files\git\bin\bash.exe" --global


##################
# User Interface #
##################

# Disable News and Interests
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows" -Name "Windows Feeds" -Force
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Feeds" -Name "EnableFeeds" -Type DWord -Value 0 -Force

# Enable Touch keyboard if no other keyboard is detected
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\TabletTip\1.7" -Name "EnableDesktopModeAutoInvoke" -Type DWord -Value 1 -Force


#################
# Time Settings #
#################

# Enable Auto Time Sync
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\w32time\Parameters" -Name "Type" -Type String -Value "NTP" -Force

# Automatically Set Time Zone
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\tzautoupdate" -Name "Start" -Type DWord -Value 4 -Force

# Sync system time
net stop w32time
w32tm.exe /unregister
w32tm.exe /register
net start w32time
w32tm.exe /resync


#################
# Energy Saving #
#################

# Disable power off USB Devices when in Lockscreen for a while
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\USB\AutomaticSurpriseRemoval" -Name "AttemptRecoveryFromUsbPowerDrain" -Type DWord -Value 0 -Force

# Disable Power Throttling
New-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling" -Force
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Power\PowerThrottling" -Name "PowerThrottlingOff" -Type DWord -Value 1 -Force

# Disable Power Button
powercfg.exe -setacvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 7648efa3-dd9c-4e3e-b566-50f929386280 0
powercfg.exe -setdcvalueindex SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 7648efa3-dd9c-4e3e-b566-50f929386280 0


############
# Security #
############

# Enable SmartScreen Filter for Store Apps
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppHost" -Name "EnableWebContentEvaluation" -Type DWord -Value 1 -Force

# Disable Remote Desktop
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name "fDenyTSConnections" -Type DWord -Value 1 -Force
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name "updateRDStatus" -Type DWord -Value 0 -Force

# Lock Windows Account after 10 login attempts.
net accounts /lockoutthreshold:10

# Unlock Windows Account after 30 minutes.
net accounts /lockoutduration:30

# Set lockout validation window to 30 minutes
net accounts /lockoutwindow:30


###########
# Privacy #
###########

# Voice Activation: Disable Online Speech Recognition
Set-ItemProperty -Path "HKLM:\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy" -Name "HasAccepted" -Type DWord -Value 0 -Force

# Disable Advertising ID
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Type DWord -Value 0 -Force

# Es werden keine Freihand- und Eingabedaten zur Verbesserung der Funktion an Microsoft mehr gesendet
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\TextInput" -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\TextInput" -Name "AllowLinguisticDataCollection" -Type DWord -Value 0 -Force

# Disable telemetry
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Type DWord -Value 0 -Force
Get-Service DiagTrack,Dmwappushservice | Stop-Service | Set-Service -StartupType Disabled

# Set sending of telemetry to basic
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "AllowTelemetry" -Type DWord -Value 1 -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\DataCollection" -Name "MaxTelemetryAllowed" -Type DWord -Value 1 -Force

# Disable Location for all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "Value" -Type String -Value "Deny" -Force

# # Disable Camera access for all apps
# Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam" -Name "Value" -Type String -Value "Deny" -Force

# # Disable Microphone access for all apps
# Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone" -Name "Value" -Type String -Value "Deny" -Force

# Disable Notifications access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userNotificationListener" -Name "Value" -Type String -Value "Deny" -Force

# Disable Account Information access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userAccountInformation" -Name "Value" -Type String -Value "Deny" -Force

# Disable Contacts access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\contacts" -Name "Value" -Type String -Value "Deny" -Force

# Disable Calendar access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\appointments" -Name "Value" -Type String -Value "Deny" -Force

# Disable Phone call access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\phoneCall" -Name "Value" -Type String -Value "Deny" -Force

# Disable Phone call history access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\phoneCallHistory" -Name "Value" -Type String -Value "Deny" -Force

# Disable Email access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\email" -Name "Value" -Type String -Value "Deny" -Force

# Disable Tasks access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\userDataTasks" -Name "Value" -Type String -Value "Deny" -Force

# Disable Messaging access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\chat" -Name "Value" -Type String -Value "Deny" -Force

# Disable Radio access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\radios" -Name "Value" -Type String -Value "Deny" -Force

# Disable Beacon access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\bluetoothSync" -Name "Value" -Type String -Value "Deny" -Force

# Disable App Diagnosis access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\appDiagnostics" -Name "Value" -Type String -Value "Deny" -Force

# Disable Voice Activation for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\activity" -Name "Value" -Type String -Value "Deny" -Force

# Disable Document access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\documentsLibrary" -Name "Value" -Type String -Value "Deny" -Force

# Disable Download access for apps of all users
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\downloadsFolder" -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\downloadsFolder" -Name "Value" -Type String -Value "Deny" -Force

# Disable Picture access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\picturesLibrary" -Name "Value" -Type String -Value "Deny" -Force

# Disable Music access for apps of all users
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\musicLibrary" -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\musicLibrary" -Name "Value" -Type String -Value "Deny" -Force

# Disable Video access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\videosLibrary" -Name "Value" -Type String -Value "Deny" -Force

# Disable File System access for apps of all users
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\broadFileSystemAccess" -Name "Value" -Type String -Value "Deny" -Force

# Disable screenshot border access for apps of all users
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\graphicsCaptureWithoutBorder" -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\graphicsCaptureWithoutBorder" -Name "Value" -Type String -Value "Deny" -Force

# Disable screenshots for all apps of all users
New-Item -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\graphicsCaptureProgrammatic" -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\graphicsCaptureProgrammatic" -Name "Value" -Type String -Value "Deny" -Force

# Disable Inking & Typing Personalization
Set-ItemProperty -Path "HKLM:\Software\Microsoft\InputPersonalization" -Name "RestrictImplicitInkCollection" -Type DWord -Value 1 -Force
Set-ItemProperty -Path "HKLM:\Software\Microsoft\InputPersonalization" -Name "RestrictImplicitTextCollection" -Type DWord -Value 1 -Force

# Disable Activity Tracking
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableActivityFeed" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "PublishUserActivities" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "UploadUserActivities" -Type DWord -Value 0 -Force

# Disable Notifications on Lock-Screen
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings" -Name "NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK" -Type DWord -Value 0 -Force

# Disable Notifications of VOIP-Calls on Lock-Screen
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings" -Name "NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK" -Type DWord -Value 0 -Force
