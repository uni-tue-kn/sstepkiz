# APDM Sensor Driver

A driver library for the [Aggregator Software](../../apps/aggregator/README.md) to communicate with the [APDM movement sensors](https://apdm.com/wearable-sensors/).
The library allows to configure the sensors, receive the UDP stream of movement sensor data from the [APDM Server](../../../tools/apdm-server/README.md), and to convert recorded raw data to synchronized HDF5 file format.

## Configuration

The APDM Sensor driver can be configured using the following environment variables:

```bash
# Parameters to start the APDM Server application:
DRIVER_APDM_SERVER_APP=java  # APDM Server application to run.
DRIVER_APDM_CONFIG_PARAMS="-jar ./apdm-server.jar -c ./apdm-config.json"  # Parameters to run APDM Server in configuration mode.
DRIVER_APDM_CONVERT_PARAMS="-jar ./apdm-server.jar -p"  # Parameters to run APDM Server in convert mode.
DRIVER_APDM_INIT_PARAMS="-jar ./apdm-server.jar -s 127.0.0.1:5000"  # Parameters to run APDM Server in initialization mode.
DRIVER_APDM_SERVER_RESTART_TIMEOUT=5000  # Wait 5000 milliseconds (= 5 seconds) before restart APDM Server application in case of failure.

# Parameters for configuration:
DRIVER_APDM_CONFIG_FILE=./apdm-config.json  # Relative or absolute path to store temporary APDM configuration file.

# Parameters for streaming:
DRIVER_APDM_LISTENER_TYPE=udp4  # Listen to IPv4 UDP data.
DRIVER_APDM_LISTENER_HOST=127.0.0.1  # Listen to UDP data received on 127.0.0.1 (= localhost).
DRIVER_APDM_LISTENER_PORT=5000  # Listen on UDP port 5000.

# Parameters for backup:
DRIVER_APDM_BACKUP_INTERVAL=5000  # Watch every 5 seconds for data to update.
DRIVER_APDM_DEVICE_UPDATE_INTERVAL=3000  # Watch every 3 seconds for docked sensors.
DRIVER_APDM_DELETE_RAW=false  # If raw files (.apdm) should be deleted after conversion (to .h5)
```

Each of the given values above are the default values.

## Trouble Shooting

### Sensors do not stream

- Was the movement channel just opened? -> Wait up to 20 seconds until streaming was started. This might take up to 1 additional minute, if configuration was started before opening movement channel.
- Is the Access Point connected to the Aggregator Tablet? -> Connect the Access Point to the Aggregator Tablet with a micro USB cable.
- Is any sensor connected to the Docking Station or the Aggregator Tablet? -> Undock and disconnect every sensor.
- Does the red LED at the Access Point blink red? -> Sensors are not configured correctly. Connect the sensors to the Docking Station and connect the Docking Station to the Aggregator Tablet. Then configure the sensors. Afterwards, undock the sensors.
- Does the green LEDs at the sensors and the Access Point blink green synchronously? -> Not a problem with APDM Sensors. Reopen the movement sensor channel.
- Still doesn't work? -> Restart the Therapist UI.
- Still doesn't work? -> Reset the APDM driver.
- Still doesn't work? -> Restart the Aggregator Server and the Therapist UI afterwards and reconnect.
