####################################################################################################
#                                   Package Installation Script                                    #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script installs all required packages for the SSTeP-KiZ project on the Aggregator Device.   #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command as Administrator:                                                   #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Install-Packages.ps1"              #
####################################################################################################

#Requires -RunAsAdministrator


# Install Git
winget.exe install --exact --silent --id Git.Git

# Install Microsoft Visual C++ 2015-2022 Redistributable x64
winget.exe install --exact --silent --id Microsoft.VC++2015-2022Redist-x64

# Install Visual Studio 2022 Build tools
winget.exe install --exact --silent --id Microsoft.VisualStudio.2022.BuildTools

# Install Python
winget.exe install --exact --silent --id Python.Python.3

# Install Microsoft OpenJDK 16 (LTS)
winget.exe install --exact --silent --id Microsoft.OpenJDK.16

# Install Node.js LTS
winget.exe install --exact --silent --id OpenJS.NodeJS.LTS

# Install Visual Studio Code
winget.exe install --exact --silent --id Microsoft.VisualStudioCode

# Install Nextcloud
winget.exe install --exact --silent --id Nextcloud.NextcloudDesktop

# Install TeamViewer Host
winget.exe install --exact --silent --id TeamViewer.TeamViewer.Host

# Update PATH variable
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Install latest NPM version
npm install --location=global npm@8.18

# Install APDM Software and Drivers
Set-Location -Path "$PSScriptRoot\..\..\tools\apdm-server\inst\"
.\MobilityLab_Setup_Win64.exe
