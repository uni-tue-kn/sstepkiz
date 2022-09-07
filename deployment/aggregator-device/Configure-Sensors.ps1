####################################################################################################
#                                   Sensor Configuration Script                                    #
####################################################################################################
#                                           Description                                            #
#                                                                                                  #
# This script configures the sensors for the SSTeP-KiZ project.                                    #
####################################################################################################
#                                          How to use it                                           #
#                                                                                                  #
# 1. Run the following command:                                                                    #
#    PowerShell.exe -NoProfile -ExecutionPolicy bypass -File "./Configure-Sensors.ps1"             #
####################################################################################################

param (
  [string]$path = "C:\sstep-kiz"
)


###################################################################
####   This script generates a sensor-configuration.json file  ####
###################################################################

# The path where the to a default sensor-configuration.json
$DefaultSensorConfigPath = "$path\backends\sensor-configuration-example.json"
# The path where the sensor-configuration.json should be placed
$DestinationFilePath = "$path\backends\sensor-configuration.json"
# Hashtabled that holds the sensor configuration
$SensorConfigDict = [Ordered]@{}

# Helper function to parse an anwer to a boolean
function AnswerToBool([String] $Answer) {
  return (($Answer -eq "y") -or ($Answer -eq "j") -or ($Answer -eq "yes") -or ($Answer -eq "ja"))
}


# Helper function to check if a Adpm sensor id is unique
function IsIdUnique([Int] $Id, [Array] $OtherSensors) {
    # Assuming the Id is unique, until a duplicate id is found
    $IdIsUnique = $TRUE
    # Check each existing entry if the Id is already in use
    foreach ($SensorEntry in $OtherSensors) {
        # Will be and stay false once a duplicate id was found 
        $IdIsUnique = $IdIsUnique -and ($SensorEntry['id'] -ne $Id)
    }
    return $IdIsUnique
}


# Helper functionnto find an unused adpm id
function FindUnusedId([Array] $OtherSensors) {
  $Id = 0
  # Check if the initial id 0 is valid
  $IdIsUnique = (IsIdUnique -Id $Id -OtherSensors $OtherSensors)
  while (-not $IdIsUnique) {
    # Increase the Id, to check the next one
    $Id += 1
    # Check if the new id is unique
    $IdIsUnique = (IsIdUnique -Id $Id -OtherSensors $OtherSensors)
  }
  # Return an Id that is not in the array
  return $Id
}


# Ask if the default config should be used
$DefaultAnswer = Read-Host -Prompt 'Sollen die Standard-Konfiguration genutzt werden? (j/n)'
$DefaultUse = AnswerToBool -Answer $DefaultAnswer

if ($DefaultUse) {
  # Copy only the default config
  Copy-Item -Path $DefaultSensorConfigPath -Destination $DestinationFilePath
  # Add APDM dll to PATH
  $currentPath = (Get-ItemProperty -Path 'Registry::HKEY_CURRENT_USER\Environment' -Name "PATH").path
  if (-Not ($currentPath -Split ";" -Contains "$path\tools\apdm-server\lib\Windows\x64")) {
    $newPath = $currentPath + ";$path\tools\apdm-server\lib\Windows\x64"
    Set-ItemProperty -Path 'Registry::HKEY_CURRENT_USER\Environment' -Name "PATH" -Value $newPath
  }
  # Update PATH variable
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
  Write-Host "Standard-Konfiguration wird verwendet."
} else {  # Generate a new config
  # Check Etk Driver
  $EtkAnswer = Read-Host -Prompt 'Soll Eyetracking genutzt werden? (j/n)'
  $EtkUse = AnswerToBool -Answer $EtkAnswer
  if ($EtkUse) {
    # Add the eyetracking config to the sensor config
    $SensorConfigDict = $SensorConfigDict + [Ordered]@{
      etk = [Ordered]@{
        "Look" = [Ordered]@{}
      }
    }
  }

  # Check Ecg Driver
  $EcgAnswer = Read-Host -Prompt 'Soll die Herzrate gemessen werden? (j/n)'
  $EcgUse = AnswerToBool -Answer $EcgAnswer
  if ($EcgUse) {
    # Add the ecg config to the sensor config
    $SensorConfigDict = $SensorConfigDict + [Ordered]@{
      ecg = [Ordered]@{
        "MovesenseEcg" = [Ordered]@{};
      }
    }
  }

  # Check Movement Driver
  $MovAnswer = Read-Host -Prompt 'Sollen Bewegungssensoren genutzt werden? (j/n)'
  $MovUse = AnswerToBool -Answer $MovAnswer
  if ($MovUse) {
    $MovDict = [Ordered]@{}
    $MovApdmAnswer = Read-Host -Prompt 'Sollen APDM Bewegungssensoren genutzt werden? (j/n)'
    $MovApdmUse = AnswerToBool -Answer $MovApdmAnswer
    if ($MovApdmUse) {
      Write-Host "Bitte geben Sie fuer jeden Sensoren eine ID und Label/Ort an. Doppelte oder ungueltige IDs werden durch gueltige ersetzt."
      $MoreSensors = (AnswerToBool -Answer (Read-Host -Prompt 'Moechten Sie einen Sensor hinzufuegen? (j/n)'))
      # Gather all active sensors and store them in the array $ActiveSensors
      $ActiveSensors = [System.Collections.ArrayList]@()
      while ($MoreSensors) {
        $SensorId = (Read-Host -Prompt 'Bitte geben Sie eine neue ID fuer den Sensor ein') -as [Int]
        # Check if the id is valid and unique (plus positive)
        $SensorIdValid = (($SensorId -match '^[0-9]+$') -and (IsIdUnique -Id $SensorId -as [Int] -OtherSensors $ActiveSensors))
        # Cast the Id to an int or generate a new one if invalid
        if ($SensorIdValid) {
          $SensorId = [Int] $SensorId
        } else {
          $SensorId = FindUnusedId -OtherSensors $ActiveSensors
          Write-Warning "ID negativ, doppelt oder ung�ltig, stattdessen wurde die ID $($SensorId) genutzt" 
        }
        # Get the label for the sensor
        $SensorLabel = Read-Host -Prompt 'Bitte geben Sie ein Label/Ort fuer den Sensor ein'
        # Add new sensor
        $ActiveSensors = $ActiveSensors + @{id = $SensorId; label = $SensorLabel}
        #Ask for more sensors
        $MoreSensors = AnswerToBool -Answer (Read-Host -Prompt 'Moechten Sie einen weiteren Sensor hinzufuegen? (j/n)')
      }
      # $StreamApdm = (AnswerToBool -Answer (Read-Host -Prompt 'Sollen APDM Sensordaten gestreamt werden? (j/n)'))
      $MovDict = $MovDict + [Ordered]@{
        'Apdm' = [Ordered]@{
          sensors = $ActiveSensors;
          ap = [Ordered]@{
            ch = 60;
            sampling_rate = 128;
          }
          # streaming = $StreamApdm
        }
      }
      # Add APDM dll to PATH
      $currentPath = (Get-ItemProperty -Path 'Registry::HKEY_CURRENT_USER\Environment' -Name "PATH").path
      if (-Not ($currentPath -Split ";" -Contains "$path\tools\apdm-server\lib\Windows\x64")) {
        $newPath = $currentPath + ";$path\tools\apdm-server\lib\Windows\x64"
        Set-ItemProperty -Path 'Registry::HKEY_CURRENT_USER\Environment' -Name "PATH" -Value $newPath
      }
      # Update PATH variable
      $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    $MovMovesenseAnswer = Read-Host -Prompt 'Sollen Movesense Bewegungssensoren genutzt werden? (j/n)'
    $MovMovesenseUse = AnswerToBool -Answer $MovMovesenseAnswer
    if ($MovMovesenseUse) {
      $MovDict = $MovDict + [Ordered]@{
        "MovesenseMov" = [Ordered]@{}
      }
    }
    # Add the movement config to the sensor config
    $SensorConfigDict = $SensorConfigDict + [Ordered]@{
      mov = $MovDict
    }
  }

  # Parse the hashtable as json string. 
  # IMPORTANT: Increase -Depth if the json should be deeper than 4
  $FinalizedConfig = ($SensorConfigDict | ConvertTo-Json -Depth 4)

  # Write the sensor-configuration file to its destination
  Out-File -InputObject $FinalizedConfig -Filepath $DestinationFilePath -Encoding ASCII

  Write-Host "Eigene Konfiguration:"
  Write-Host $FinalizedConfig
}
