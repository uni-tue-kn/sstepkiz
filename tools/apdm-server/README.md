# APDM Server

A console application to stream received data from the APDM movement sensors to a UDP server.

## Table of contents

1. [Requirements](./README.md#1-requirements)
2. [Installation Guide](./README.md#2-installation-guide)
3. [Usage Guide](./README.md#3-usage-guide)
   1. [Sensor Configuration](./README.md#31-sensor-configuration)
   2. [Sensor data streaming](./README.md#32-sensor-data-streaming)
4. [Manual](./README.md#4-manual)
   1. [Configuration](./README.md#41-configuration)
   2. [Command Line Interface (CLI)](./README.md#42-command-line-interface-cli)
5. [Development](./README.md#5-development)
   1. [Setup development environment](./README.md#51-setup-development-environment)
   2. [Setup Visual Studio Code](./README.md#52-setup-visual-studio-code)

## 1. Requirements

- Linux x64 or Windows x64 based Operating System
- Java Runtime Environment (JRE) 8 x64

The target platform is Windows 10 2004 x64.
Ubuntu Desktop 20.04 x64 is tested too.

## 2. Installation Guide

The APDM Server is a cross platform Java application.
To install it, use one of the following guides, depending on your operating system.

**For Linux users:**

On Ubuntu 20.04, use the following command to install the Java Runtime Environment (JRE) 8:

```bash
$ sudo apt-get update
$ sudo apt-get install default-jre
```

Also make sure, that the directory of the `libapdm.so` file is in your `LD_LIBRARY_PATH` variable.
You can set this by executing the following command:

```bash
/tools/apdm-server$ export LD_LIBRARY_PATH=$(pwd)/lib/Linux/x64:$LD_LIBRARY_PATH
```

You can then execute the APDM Server using the following command:

```bash
/tools/apdm-server$ java -jar ./apdm-server.jar
```

**For Windows users:**

On Windows 10, download version 8 of the Java Runtime Environment (JRE) x64 from the [official website](https://www.java.com/en/download/manual.jsp) and install it.

Also make sure, that the directory of the `apdm.dll` file is in your `PATH` variable.
You can set this by executing the following command in Power Shell:

```powershell
PS C:\sstep-kiz\tools\apdm-server> $env:PATH += ";$pwd\lib\Windows\x64"
```

You can then execute the APDM Server using the following command:

```powershell
PS C:\sstep-kiz\tools\apdm-server> java.exe -jar .\apdm-server.jar
```

## 3. Usage Guide

### 3.1. Sensor Configuration

To configure the APDM Opal sensors, connect them via USB to your computer and start the APDM Server with the following command line:

```bash
/tools/apdm-server$ java -jar ./apdm-server.jar -c ./sensor-configuration.json
```

This will configure the sensors as described in the file `sensor-configuration.json`.

*The configuration file is documented in [section 4.1.](./README.md#41-configuration).*

### 3.2. Sensor data streaming

To stream the sensor data, the Opal Sensors need to be connected to the Access Point, which is connected to the computer running the APDM Server, as depicted in the following figure.
**Make sure, that the Opal Sensors are not connected via USB! THIS WILL NOT WORK!**

![APDM Sensor data pipeline](./docs/apdmserver-transport.svg)

To start the streaming of sensor data via UDP, make sure that your UDP Server which will receive the data is running.

Then use the following command to start the streaming:

```bash
/tools/apdm-server$ java -jar ./apdm-server.jar -s 127.0.0.1:5000
```

This will stream the data to the UDP server running on host `127.0.0.1` and port `5000`, which is the default host and port.

Alternatively you can also stream to IPv6 addresses using the following command:

```bash
/tools/apdm-server$ java -jar ./apdm-server.jar -s [::1]:5000
```

This will stream to `::1` on port `5000`.
**Make sure to put IPv6 addresses into [square brackets]!**

It is also possible to stream to host names or multiple UDP servers, using comma-separated target endpoints:

```bash
/tools/apdm-server$ java -jar ./apdm-server.jar -s localhost:5001,[::1]
```

This will stream to the host `localhost` on port `5001` and via IPv6 to `::1` on port `5000`.

*The Command Line Interface (CLI) is documented in [section 4.2.](./README.md#42-command-line-interface-cli).*

## 4. Manual

### 4.1. Configuration

The configuration of the sensors is done using a configuration file in JSON format (`.json`).
A typical configuration might look as follows:

```json
{
  "sensors": [
    {
      "id" : 10704,
      "label": "Lumbar"
    },
    {
      "id": 10758,
      "label": "Left hand"
    },
    {
      "id": 10739,
      "label": "Right hand"
    }
  ],
  "ap": {
    "ch": 60,
    "sampling_rate": 128
  },
  "erase": true
}
```

It contains a JSON object (`{...}`) with the attributes `sensors` and `ap`.

The attribute `sensors` is an array (`[...]`) of sensor device configurations.
Each sensor device configuration is a JSON object with three optional attributes:

- `id` which stands for the Device ID of the sensor which is displayed on the page of the APDM Opal sensor which also displays the CE logo.
If not set or the value is negative, a random device whose ID is not specified, will be used.
It defaults to `-1`.
- `label` which is the label that should be displayed on the page of the APDM Opal sensor which also displays the connection, battery and storage status.
If there are more than 15 characters, the text will be cut off.
It defaults to `""`.
- `erase` which is a boolean that indicates whether (`true`) or not (`false`) the internal storage should be cleared after disconnection the sensor from the computer.
It defaults to `false`.

The attribute `ap` is a JSON object (`{...}`) with the following optional attributes:

- `ch` which is the channel number.
Allowed values are `10`, `20`, `30`, `40`, `50`, `60`, `70`, and `80`.
It defaults to `60`. 
- `sampling_rate` which is the sampling rate of the sensors in hz.
Allowed values are `20`, `32`, `40`, `64`, `80`, and `128`.
It defaults to `128`.

The configuration can be applied using the `--configure` CLI parameter which is described in [section 4.2.1](#421-sensor-configuration).

### 4.2. Command Line Interface (CLI)

#### 4.2.1. Sensor configuration

```bash
java -jar ./apdm-server.jar [-c | --configure] [<config-file>]
```

Specifies, that sensors should be configured.
**This requires, that the sensors are connected to the system via USB!**

This parameter will also synchronize the selected APDM Opal sensor's time with the [UTC](https://en.wikipedia.org/wiki/Coordinated_Universal_Time) system time of the host computer that executes the configuration.

##### `config-file`

**Default**: `./sensor-config.json`

Specifies the absolute or relative path to the sensor configuration file.

#### 4.2.2. Logging

```bash
java -jar ./apdm-server.jar [-l | --log | --logfile] [<path>]
```

Enables logging.

##### `path`

**Default**: `./apdmserver.log`

Specifies the absolute or relative path to the log file.

#### 4.2.3. Data Streaming

```bash
java -jar ./apdm-server.jar [-s | --stream] [<host>[:<port>]]
```

Specifies that the received sensor data should be streamed to a UDP server.

##### `host`

**Default**: `localhost`

Host of UDP server to stream data to.

##### `port`

**Default**: `5000`

Port of UDP server to stream data to.

#### 4.2.4. Verbosity

```bash
java -jar ./apdm-server.jar [-v | --verbose]
```

Enables verbose console output.
This includes received sensor data.

#### 4.2.5. Data Processing

```bash
java -jar ./apdm-server.jar [-p | --process] <source_path> [<source_path> ...] <destination_path>
```

Converts APDM (.apdm) files to HDF5 (.h5) files.

##### `source_path`

Absolute or relative paths to APDM source files.

##### `destination_path`

Absolute or relative path to HDF5 destination file.

## 5. Development

### 5.1. Setup development environment

For development of the APDM Server, you need to install version 11 of the Java Development Kit (JDK).
It is recommended, but not required to use AdoptOpenJDK instead of the Oracle version.

To install AdoptOpenJDK, use one of the following guides, depending on your operating system.
An installation guide for other operating systems and architectures can be found [here](https://adoptopenjdk.net/installation.html).

**For Linux users:**

On Ubuntu 20.04, use the following commands to install AdoptOpenJDK 11:

```bash
$ wget -qO - https://adoptopenjdk.jfrog.io/adoptopenjdk/api/gpg/key/public | sudo apt-key add -
$ sudo add-apt-repository --yes https://adoptopenjdk.jfrog.io/adoptopenjdk/deb/
$ sudo apt-get install -y software-properties-common
$ sudo apt-get install -y adoptopenjdk-11-hotspot
```

Also make sure, that the directory of the `libapdm.so` file is in your `LD_LIBRARY_PATH` variable, as in [section 2](./README.md#2-installation-guide).

**For Windows users:**

First download the latest JDK version of AdoptOpenJDK 11 for Windows (x64) from [the official website](https://adoptopenjdk.net/releases.html?variant=openjdk11&jvmVariant=hotspot) as a `.msi` file.

Then install AdoptOpenJDK 11 using the downloaded `.msi` file.
Make sure to include the options **Add to PATH** and **Configure JAVA_PATH-Home variable**.


Also make sure, that the directory of the `apdm.dll` file is in your `PATH` variable, as in [section 2](./README.md#2-installation-guide).

### 5.2. Setup Visual Studio Code

If you whish to use [Visual Studio Code](https://code.visualstudio.com/) as an IDE for the development of the APDM Server, install it as described in the [Environment Setup Guide](../../docs/environment-setup.md#4-visual-studio-code).

It is recommended to install the VS Code extension [Java Extension Pack](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-java-pack).
After installing the extension, restart Visual Studio Code.

Then open the project path `/tools/apdm-server` in a new Visual Studio Code window.
You will then be able to run and debug the code using the key **F5**.
