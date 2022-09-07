##################
# Privacy Settings
##################

## Windows Policies
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
Set-ItemProperty -Path HKLM:\Software\Microsoft\Speech_OneCore\Settings\OnlineSpeechPrivacy -Name HasAccepted -Type DWord -Value 0

# Inking & Typing Personalization: Get To Know Me
@('RestrictImplicitInkCollection','RestrictImplicitTextCollection') |% { Set-ItemProperty -Path HKLM:\Software\Microsoft\InputPersonalization -Name $_ -Type DWord -Value 1 }

# Disable Telemetry/Diagnosis and Feedback (requires a reboot to take effect)
Set-ItemProperty -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection -Name AllowTelemetry -Type DWord -Value 0
Get-Service DiagTrack,Dmwappushservice | Stop-Service | Set-Service -StartupType Disabled

# Activity Tracking: Disable
@('EnableActivityFeed','PublishUserActivities','UploadUserActivities') |% { Set-ItemProperty -Path HKLM:\SOFTWARE\Policies\Microsoft\Windows\System -Name $_ -Type DWord -Value 0 }


## App Policies
# Location: Disable
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location -Name Value -Type String -Value Deny -Force
# Camera: Disable App Store access
# Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam -Name Value -Type String -Value Deny -Force
# Microphone: Disable App Store access
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone -Name Value -Type String -Value Deny -Force
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
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Search -Name backgroundAppGlobalToggle -Type DWord -Value 0 -Force
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


##################
# Settings
##################

## Create SearchSettings Entry
### New-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings
## SafeSearch: Set Safe search to strict(2)
Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name SafeSearchMode -Type DWord -Value 2
## Disable Microsoft-Account, Educational-Account and History
@('IsMSACloudSearchEnabled','IsAADCloudSearchEnabled', 'IsDeviceSearchHistoryEnabled') |% { Set-ItemProperty -Path HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings -Name $_ -Type DWord -Value 0 }


## Downloads: DoSvc ( HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\DoSvc or HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Config)
#Disable Completely:  Get-Service DoSvc | Stop-Service | Set-Service -StartupType Disabled
# Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Config -Name DoDownloadMode -Type DWord -Value 0
# Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\DeliveryOptimization\Settings -Name DownloadRateBackgroundPct -Type String -Value 25


## Notifications
# Disable Notifications on Lock-Screen
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings -Name NOC_GLOBAL_SETTING_ALLOW_TOASTS_ABOVE_LOCK -Type DWord -Value 0
# Disable Notifications of VOIP-Calls on Lock-Screen
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Notifications\Settings -Name NOC_GLOBAL_SETTING_ALLOW_CRITICAL_TOASTS_ABOVE_LOCK -Type DWord -Value 0
# Show Windows Welcome Screen
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-310093Enabled -Type DWord -Value 0
# Propose setup completion for optimal Usage
# --- Not Available
# Show Tips and Tricks
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager -Name SubscribedContent-338389Enabled -Type DWord -Value 0

## Shared User
# Disable Share nearby
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name NearShareChannelUserAuthzPolicy -Type DWord -Value 0
# Disable Share on devices
Set-ItemProperty -Path HKCU:\Software\Microsoft\Windows\CurrentVersion\CDP -Name RomeSdkChannelUserAuthzPolicy -Type DWord -Value 0

## Disable Clipboard
Set-ItemProperty -Path HKCU:\Software\Microsoft\Clipboard -Name EnableClipboardHistory -Type DWord -Value 0

## Remote Desktop
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name fDenyTSConnections -Type DWord -Value 1
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name updateRDStatus -Type DWord -Value 0


## Apps: Disable Autostart
# -------------------- HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run and/or HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run

## Time and Language
# Enable Auto Time Sync
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\W32Time\Parameters -Name Type -Type String -Value NTP
# Automatically Set Time Zone
Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Services\tzautoupdate -Name Start -Type DWord -Value 4


################
# Other Settings
################

# Enable Touch keyboard if no other keyboard is detected
Set-ItemProperty -Path HKLM:\SOFTWARE\Microsoft\TabletTip\1.7 -Name EnableDesktopModeAutoInvoke -Type DWord -Value 1
