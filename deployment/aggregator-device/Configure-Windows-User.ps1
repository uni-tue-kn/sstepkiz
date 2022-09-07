####################################################################################################
#                                Windows User Configuration Script                                 #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script configures the current user of the Windows 11 device.                                #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Configure-Windows-User.ps1"        #
####################################################################################################


####################
# Program Settings #
####################

# Configure bash as NPM console
npm config set script-shell "C:\Program Files\git\bin\bash.exe"

# Update Edge Settings
Copy-Item "$PSScriptRoot\Preferences" -Destination "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"

# Update Start Menu Layout
Copy-Item -Path "$PSScriptRoot\LayoutModification.json" -Destination "$env:LOCALAPPDATA\Microsoft\Windows\Shell"


###########
# Privacy #
###########

# Disable Input Personalization for pen and keyboard
Set-ItemProperty -Path "HKCU:\Software\Microsoft\InputPersonalization" -Name "RestrictImplicitInkCollection" -Type DWord -Value 1 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\InputPersonalization" -Name "RestrictImplicitTextCollection" -Type DWord -Value 1 -Force

# Disable access to contacts for input personalization
Set-ItemProperty -Path "HKCU:\Software\Microsoft\InputPersonalization\TrainedDataStore" -Name "HarvestContacts" -Type DWord -Value 0 -Force

# Disable personalization in general by not accepting privacy policy
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Personalization\Settings" -Name "AcceptedPrivacyPolicy" -Type DWord -Value 0 -Force

# Disable Advertising ID
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Type DWord -Value 0 -Force

# Disable website access to language list
Set-ItemProperty -Path "HKCU:\Control Panel\International\User Profile" -Name "HttpAcceptLanguageOptOut" -Type DWord -Value 1 -Force

# Disable sending diagnosticy and feedback
New-Item -Path "HKCU:\Software\Microsoft\Siuf" -Force
New-Item -Path "HKCU:\Software\Microsoft\Siuf\Rules" -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Siuf\Rules" -Name "NumberOfSIUFInPeriod" -Type Dword -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Siuf\Rules" -Name "PeriodInNanoSeconds" -Type Dword -Value 0 -Force

# Disable Voice Activation
New-Item -Path "HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps" -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps" -Name "AgentActivationEnabled" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Speech_OneCore\Settings\VoiceActivation\UserPreferenceForAllApps" -Name "AgentActivationOnLockScreenEnabled" -Type DWord -Value 0 -Force

# Disable Trace app starts
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Start_TrackProgs" -Type DWord -Value 0 -Force

## Disable Microsoft-Account, Educational-Account, and History Search
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\SearchSettings" -Name "IsMSACloudSearchEnabled" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\SearchSettings" -Name "IsAADCloudSearchEnabled" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\SearchSettings" -Name "IsDeviceSearchHistoryEnabled" -Type DWord -Value 0 -Force


############
# Security #
############

# Disable AutoPlay
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers" -Name "DisableAutoplay" -Type DWord -Value 1 -Force

## Disable Clipboard History
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Clipboard" -Name "EnableClipboardHistory" -Type DWord -Value 0 -Force

# Disable Nearby Share
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP" -Name "NearShareChannelUserAuthzPolicy" -Type DWord -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP" -Name "RomeSdkChannelUserAuthzPolicy" -Type DWord -Value 0 -Force


#################
# Energy Saving #
#################

# Disable Background Apps for apps of all users
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Type DWord -Value 1 -Force


##################
# User Interface #
##################

# Disable "Get more out of Windows" screen
New-Item -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\UserProfileEngagement" -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\UserProfileEngagement" -Name "ScoobeSystemSettingEnabled" -Type DWord -Value 0 -Force

## Set Safe search to strict
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\SearchSettings" -Name "SafeSearchMode" -Type DWord -Value 2 -Force

# Remove Widgets from Taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarDa" -Type Dword -Value 0 -Force

# Remove Chat from Taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarMn" -Type Dword -Value 0 -Force

# Remove Search from Taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "SearchboxTaskbarMode" -Type Dword -Value 0 -Force
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Search" -Name "SearchboxTaskbarMode" -Type DWord -Value 0 -Force

# Remove Active Apps from Taskbar
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "ShowTaskViewButton" -Type Dword -Value 0 -Force

# Disable suggestions in Settings app
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338393" -Type DWord -Value 0 -Force

# Disable Windows Welcome Screen
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-310093Enabled" -Type DWord -Value 0 -Force

# Disable show Tips and Tricks
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338389Enabled" -Type DWord -Value 0 -Force
