# Windows Settings
Start the Powershell as with administrator rights in this directory.

Then run `powershell.exe -noprofile -executionpolicy bypass -file .\ADWindowsSettings.ps1`.


Some Settings must be set manually via the Ordinary Windows Settings. Those are:
- Disable **Settings > Privacy Settings > General > Let Apps Access Language List**
- Deny access to the **webcam** for each App Store-App in **Settings > Privacy Settings > Webcam** (but do not disable it completely)
- Deny access to the **microphone** for each App Store-App in **Settings > Privacy Settings > Microphone** (but do not disable it completely)
- Disable everything in **Settings > Apps > Autostart**
- Disable 'Allow downloads from other PCs' in **Settings > Update and Security > Delivery Optimization (Übermittlungsoptimierung)**. Then go to **Advanced Options** enable **Restric Bandwith for Background Updates** and set it's value to **25%**


Make sure, that the Settings were set correctly and report possible wrong settings.


# Programm Installer, Edge Setup & Git-Updater

Start the Powershell as with administrator rights in this directory.
Then run `powershell.exe -noprofile -executionpolicy bypass -file .\ADPrograms.ps1`.


** Be sure the Preference file is present **

*Note: If the location of the git-repo changes, the script must be edited. *

## Update Scheduler
A scheduled task will be created uppon executing the ADPrograms script.
This will check for Git commits to the SSTeP-KiZ master branch uppon user logon. 
It then will pull, install and build everything in production mode on the local device.

**Be sure to set the `-File`-argument to the location of the GitManager-Script. 
Make sure the group name is right (depends on the system language and is default configured for german windows).**


## Alternative
Download all installers as described in the aggregator setup Readme in this folder and make sure to update the software if neccessary.


Replace the 'Preferences' file at '%localappdata%\Microsoft\Edge\User Data\Default'.
To access %localappdata%, press Windows Key + R, enter %localappdata% and click 'Ok'.

Schedule a Task using **Aufgabenplanung** (as Admin) and scheduling it for all authenticated users:
- Create a new scheduled task on the right
- Give it the name "SSTeP-KiZ Aggregator-UI Updater"
- In **General** set the Group to `NT-AUTHORITY\AUTHORIZED USERS`(or its german translation `NT-AUTORITÄT\AUTHORISIERTE BENUTZER`; use the expanded search to find it) and check "Execute with highest rights"
- Set the **Trigger** to **On User Logon**
- Set the **Action** to **C:\Windows\system32\WindowsPowerShell\v1.0\powershell.exe** and add the argument **-NoExit -File C:\SSTeP-KiZ-GitManager.ps1** (*Or change the Path to the Location of the GitManager-Script*)
- In **Requirements uncheck everything**
- In **Settings** set **check everything except 'If no other Task is scheduled, delete after ...'**

**Be sure to execute the GitManager-Script at least once with admin rights to install the repo. **
