####################################################################################################
#                             Windows Default App Uninstallation Script                            #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script removes all default Apps installed by Windows 11.                                    #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Uninstall-WindowsDefaultApps.ps1"  #
####################################################################################################


# Remove Get Started App
Get-AppxPackage Microsoft.Getstarted | Remove-AppxPackage

# Remove News App
Get-AppxPackage Microsoft.BingNews | Remove-AppxPackage

# Remove Weather App
Get-AppxPackage Microsoft.BingWeather | Remove-AppxPackage

# Remove Xbox App
Get-AppxPackage Microsoft.GamingApp | Remove-AppxPackage

# Remove Get Help
Get-AppxPackage Microsoft.GetHelp | Remove-AppxPackage

# Remove Microsoft Office Hub
Get-AppxPackage Microsoft.MicrosoftOfficeHub | Remove-AppxPackage

# Remove Microsoft Solitaire Collection
Get-AppxPackage Microsoft.MicrosoftSolitaireCollection | Remove-AppxPackage

# Remove Sticky Notes
Get-AppxPackage Microsoft.MicrosoftStickyNotes | Remove-AppxPackage

# Remove People App
Get-AppxPackage Microsoft.People | Remove-AppxPackage

# Remove Power Automate
Get-AppxPackage Microsoft.PowerAutomateDesktop | Remove-AppxPackage

# Remove Microsoft To Do
Get-AppxPackage Microsoft.Todos | Remove-AppxPackage

# Remove Alarms and Clock
Get-AppxPackage Microsoft.WindowsAlarms | Remove-AppxPackage

# Remove Windows Feedback Hub
Get-AppxPackage Microsoft.WindowsFeedbackHub | Remove-AppxPackage

# Remove Windows Maps
Get-AppxPackage Microsoft.WindowsMaps | Remove-AppxPackage

# Remove Windows Sound Recorder
Get-AppxPackage Microsoft.WindowsSoundRecorder | Remove-AppxPackage

# Remove Xbox Gaming Overlay
Get-AppxPackage Microsoft.Xbox.TCUI | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxGameOverlay | Remove-AppxPackage
Get-AppxPackage Microsoft.XboxGamingOverlay | Remove-AppxPackage

# Remove Xbox Speech-to-Text Overlay
Get-AppxPackage Microsoft.XboxSpeechToTextOverlay | Remove-AppxPackage

# Remove Your Phone
Get-AppxPackage Microsoft.YourPhone | Remove-AppxPackage

# Remove Groove Music
Get-AppxPackage Microsoft.ZuneMusic | Remove-AppxPackage

# Remove Movies & TV
Get-AppxPackage Microsoft.ZuneVideo | Remove-AppxPackage

# Remove Windows Mail and Calendar App
Get-AppxPackage microsoft.windowscommunicationsapps | Remove-AppxPackage

# Remove Microsoft Paint
Get-AppxPackage Microsoft.Paint | Remove-AppxPackage

# Remove Microsoft Xbox Identity Provider
Get-AppxPackage Microsoft.XboxIdentityProvider | Remove-AppxPackage

# Remove Microsoft Teams
Get-AppxPackage MicrosoftTeams | Remove-AppxPackage

# Remove Microsoft OneDrive
Get-AppxPackage Microsoft.OneDriveSync | Remove-AppxPackage

# Remove XING
Get-AppxPackage XINGAG.XING | Remove-AppxPackage

# Remove Spotify
Get-AppxPackage SpotifyAB.SpotifyMusic | Remove-AppxPackage

# Remove Disney+
Get-AppxPackage Disney.37853FC22B2CE | Remove-AppxPackage

# Remove Realtek Audio Control
Get-AppxPackage RealtekSemiconductorCorp.RealtekAudioControl | Remove-AppxPackage

# Remove Cortana
Get-AppxPackage Microsoft.549981C3F5F10 | Remove-AppxPackage
