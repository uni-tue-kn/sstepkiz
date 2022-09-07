# Sensor Setup

### 1.3. Install Aggregator Software

A PowerShell Script to install and update the Aggregator-Software is provided in `/deployment/aggregator-device/SSTeP-KiZ-GitManager.ps1`, but will also be scheduled uppon user logon. 
Use `powershell.exe -noprofile -executionpolicy bypass -file \<Script\>` to execute it in an **administrative** Powershell. See [SetupScripts](./SetupScripts.md) for further information.

Open PowerShell in directory `C:\` and clone the SSteP-KiZ repository:

```powershell
PS C:\> git clone https://git.bs-wit.de/jop/sstep-kiz.git
```

Then install depencencies and build the shared project for production:

```powershell
PS C:\ cd .\sstep-kiz\shared\
PS C:\sstep-kiz\shared> npm install
PS C:\sstep-kiz\shared> npm run build
```

After that install dependencies and build the Aggregator UI for production:

```powershell
PS C:\sstep-kiz\shared> cd ..\frontends\
PS C:\sstep-kiz\frontends> npm install
PS C:\sstep-kiz\frontends> npm run build:aggregator
```

Before you build the Aggregator Server make sure all the necessary drivers are selected for the compilation process.
By default, all the available drivers should be enabled.
Therefore open the file `C:\sstep-kiz\backends\apps\aggregator\src\driver-modules.ts` and make sure that all of the necessary driver modules are in the `DRIVER_MODULES` array:

```typescript
import { ApdmModule } from '@libs/apdm';            // Location of APDM driver module.
import { LookModule } from '@libs/look';            // Location of Look driver module.
import { MovesenseModule } from '@libs/movesense';  // Location of Movesense driver module.

export const DRIVER_MODULES = [
  ApdmModule,       // Driver module for APDM movement sensors.
  LookModule,       // Driver module for Look! Eye Tracking sensors.
  MovesenseModule,  // Driver module for Movesense ECG sensors.
];
```

*Hint: If some of the drivers will not be needed, they can almost be deactivated before execution of the Aggregator Server, so if it is not clear which drivers are needed, all the available drivers could be selected.*

The driver module names are given in section 1.4. for the individual sensors.

Finally install dependencies and (re-)build the Aggregator Server for production:

```powershell
PS C:\sstep-kiz\frontends> cd ..\backends\
PS C:\sstep-kiz\backends> npm install
PS C:\sstep-kiz\backends> npm run build:aggregator
```

Now the sensors need to be configured before the Aggregator Software can be executed.
Therefore open the file `C:\sstep-kiz\backends\sensor-configuration.json` and configure the sensors:

```json
{
  "ecg": {
    "driver": "Movesense",    // Sensor driver name.
    "configuration": {}       // Sensor driver configuration.
  },
  "eda": null,                // No EDA driver used.
  "etk": {
    "driver": "Look",         // Sensor driver name.
    "configuration": { ... }  // Sensor driver configuration.
  },
  "mov": {
    "driver": "APDM",         // Sensor driver name.
    "configuration": { ... }  // Sensor driver configuration.
  }
}
```

The configuration should already contain a general purpose configuration of the sensors.
A more detailed documentation about the configuration of the sensors can be found in the individual sensor driver libraries.

The following section also describes how to install additional dependencies of the sensor drivers.

### 1.4. Install sensor drivers

Depending on the used sensors, the installation of additional dependencies of the related drivers may be necessary.

#### 1.4.1. APDM movement sensors

##### 1.4.1.1. Driver Module Compilation

To use access the APDM movement sensors, the APDM sensor driver module needs to be compiled into the Aggregator Server as described in [section 1.3](#13-install-aggregator-software).
The APDM sensor driver module is called `ApdmModule` and it is located in `@libs/apdm`.

##### 1.4.1.2. Driver Module Configuration

After compilation of the APDM movement sensors, the APDM sensor driver module needs to be configured as described in [section 1.3](#13-install-aggregator-software).
The APDM sensor driver name is `APDM`.

A detailed documentation of the configuration is given [here](../backends/libs/apdm/README.md).

##### 1.4.1.3. Additional dependencies

To interact with the APDM movement sensors it is required to install the drivers which are included in the installation package of the APDM Mobility Lab software.
The software cannot be downloaded from the public APDM website, the installation package can be found on the USB thumb drive which is included in the suitcase of the sensors.
The Installation file is called `MobilityLab_Setup_Win64.exe`.

Since the Mobility Lab installation also installs the necessary drivers for the APDM sensors, there might be multiple popups asking for the installation of drivers of APDM Inc.
They must also be installed.

To stream the movement data to the therapist it is also necessary to add the directory `C:\sstep-kiz\tools\apdm-server\lib\Windows\x64` to the system's `PATH` environment variable.
Therefore search for `path` and open **Systemungebungsvariablen bearbeiten** and click on **Umgebungsvariablen...**.
On the bottom (**Systemvariablen**) double click the variable `Path`, click on **Neu** and paste the path `C:\sstep-kiz\tools\apdm-server\lib\Windows\x64`.
Then press ENTER and click **OK** to apply.

After the next restart the environment variable should be applied.

#### 1.4.2. Look! eye tracker

##### 1.4.2.1. Driver Module Compilation

To use access the Look! eye tracker, the Look sensor driver module needs to be compiled into the Aggregator Server as described in [section 1.3](#13-install-aggregator-software).
The Look eye tracking driver module is called `LookModule` and it is located in `@libs/look`.

##### 1.4.2.2. Driver Module Configuration

After compilation of the Look eye tracker module, the Look sensor driver module needs to be configured as described in [section 1.3](#13-install-aggregator-software).
The Look sensor driver name is `Look`.

A detailed documentation of the configuration is given [here](../backends/libs/look/README.md).

##### 1.4.1.3. Additional dependencies

To interact with the Look! Eye Tracker it is required to install the Look Software.
Therefore, download the Look Software and install it.

*Currently, there is no official download link, so please ask [Dr. Thomas Kübler](https://www.hci.uni-tuebingen.de/chair/team/thomas-kuebler) for a copy of the latest version.*
