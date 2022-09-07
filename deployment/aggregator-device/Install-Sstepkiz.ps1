####################################################################################################
#                                  SSTeP-KiZ Installation Script                                   #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This installs or updates the SSTeP-KiZ Aggregator Software.                                      #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Install-Sstepkiz.ps1"              #
####################################################################################################

param (
  [switch]$force = $false,
  [string]$path = "C:\sstep-kiz",
  [string]$repo = "https://git.bs-wit.de/jop/sstep-kiz.git"
)

# Update NPM
npm install --location=global npm@8.18

# Download source code of SSTeP-KiZ project if not yet done
if ( !(Test-Path $path -PathType Container) ) {
  git.exe clone "$repo" "$path"
}

# Check for source code changes of SSTeP-KiZ software.
Set-Location -Path "$path\"
git.exe fetch --all

# Update SSTeP-KiZ Software if changes were found
if ( $force -or ($(git.exe rev-parse HEAD) -ne $(git.exe rev-parse origin/$(git.exe branch --show-current))) ) {
  # Download latest source code removing all changes
  git.exe reset --hard
  git.exe pull

  # Install node packages and compile shared library
  Set-Location -Path "$path\shared\"
  npm install
  npm run build

  # Install node packages and compile backend
  Set-Location -Path "$path\backends\"
  npm install
  npm run build:aggregator

  # Install node packages and compile frontend
  Set-Location -Path "$path\frontends\"
  npm install
  npm run build:aggregator
}
