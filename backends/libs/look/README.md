# Look Sensor Driver

A driver library for the [Aggregator Software](../../apps/aggregator/README.md) to communicate with the [Look! Eye Tracking sensors](https://www.fahren-sie-sicher.de/).
The library allows to calibrate the sensors, receive the resulting video stream of the eye tracker, and to record the video stream as MP4 video file and journal files containing the gaze estimations.

## Configuration

The Look sensor driver can be configured using the following environment variables:

```bash
# Parameters to start Look Server application:
DRIVER_LOOK_SERVER_APP="./Look.exe" # Look Server application to run.
DRIVER_LOOK_INIT_PARAMS=""          # Parameters to run Look Server application.
DRIVER_LOOK_RESTART_TIME=5000       # Wait 5000 milliseconds (= 5 seconds) before restart Look Server application in case of failure.

# Parameters for WebRTC connection establishment.
DRIVER_LOOK_SIGNALLING_ENDPOINT=http://localhost:8080/offer # REST Endpoint for WebRTC Connection establishment.
```

Each of the given values above are the default values.

## Trouble Shooting

### Eye Tracker does not stream

- Was the eye tracking channel just opened? -> Wait up to 20 seconds until streaming was started.
- Is the eye tracker connected to the Aggregator Tablet? -> Connect the eye tracker with the USB-A cable to the Aggregator Tablet.
- Is the Aggregator UI connected to the eye tracking software? -> Check if the connect icon on the top right corner of the Eye Tracker tile of the Aggregator UI indicates, that connection is established (green). If not, press the connect or reconnect button in the Aggregator UI eye tracking tile. If it is connected, restart the Therapist UI and reconnect.
- Can the Aggregator UI connect to the eye tracking software? -> If connecting does not work, restart the eye tracking driver using the reload button on the Aggregator UI eye tracking tile and confirm with yes.
- Still doesn't work? -> Restart the Aggregator Server and the Therapist UI afterwards and reconnect.

### Eye Tracker field camera is black

- Check if the black cap on the field camera is removed.
