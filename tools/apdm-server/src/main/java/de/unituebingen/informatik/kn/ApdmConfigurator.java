package de.unituebingen.informatik.kn;

import com.apdm.APDMAPOpenException;
import com.apdm.APDMException;
import com.apdm.Context;
import com.apdm.Device;
import com.apdm.DockingStation;
import com.apdm.swig.apdm;
import com.apdm.swig.apdm_streaming_config_t;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;

public class ApdmConfigurator {
    /**
     * Configures the APDM sensors.
     * @param configuration Configuration to apply.
     * @throws APDMAPOpenException
     * @throws APDMException
     * @throws Exception
     */
    public static void Configure(ApdmConfiguration configuration) throws APDMAPOpenException, APDMException, Exception {
        // Apply properties of all sensors.
        try {
            configureSensorProperties(configuration);
        } catch (APDMException e) {
            throw new Exception("Failed to configure sensor properties: " + e.getMessage());
        }

        // Apply streaming configuration.
        if (configuration.streaming) {
            try {
                configureStreaming(configuration.accessPoint);
            } catch (APDMException e) {
                throw new Exception("Failed to configure sensor data streaming: " + e.getMessage());
            }
        } else {
            try {
                configureRecording(configuration);
            } catch (APDMException e) {
                throw new Exception("Failed to configure sensor data recording: " + e.getMessage());
            }
        }
    }

    /**
     * Applies a configuration to one sensor.
     * @param index Index of sensor's docking station.
     * @param configuration Configuration to apply.
     * @param erase Wether sensors should be erased after disconnect.
     * @throws APDMException
     */
    private static void configureSensor(int index, SensorConfiguration configuration, boolean erase) throws APDMException {
        // Connects to a sensor.
        final DockingStation dock = DockingStation.openByIndex(index);
        try {
            // Ensure that sensor is available.
            if (!dock.isMonitorPresent()) {
                return;
            }

            final Device d = dock.attachedDevice;

            // Set configured label.
            d.cmd_set_device_label(configuration.label);
            // Set timezone to UTC.
            d.cmd_set_device_timezone_offset_v2(0);
            // Set time of this system.
            d.setTimeNow(true);

            // Apply configuration to sensor.
            d.cmd_config_commit();

            // Apply erase configuration.
            if (erase) {
                d.eraseLoggedData();
            }
        } finally {
            // Close connection to sensor device.
            dock.close();
        }
    }

    /**
     * Configures properties of all sensors.
     * @param sensorsConfigurations Configuration of sensors to apply. 
     * @throws APDMException
     */
    private static void configureSensorProperties(ApdmConfiguration configuration) throws APDMException {
        // Prepare mapping of device indexes to configurations to apply.
        final HashMap<Integer, SensorConfiguration> configurations = new HashMap<Integer, SensorConfiguration>();
        // Prepare queue of sensor configurations without fixed sensor IDs.
        final Queue<SensorConfiguration> freeConfigurations = new LinkedList<SensorConfiguration>();
        // Go through all sensor configurations and map configurations with given IDs to indexes and enqueue configurations without.
        for (SensorConfiguration config : configuration.sensors) {
            if (config.id < 0) {
                // No sensor ID given -> Add to non-fixed sensor configurations.
                freeConfigurations.add(config);
            } else {
                // Sensor ID given -> Apply configuration.
                final int index = DockingStation.getIndexByDeviceId(config.id);
                configurations.put(index, config);
            }
        }

        Context context = null;
        try {
            context = Context.getInstance();
            // Apply sensor configurations.
            final int numDevices = DockingStation.getNumAttached();
            for (int i = 0; i < numDevices; i++) {
                // Get configuration to apply or null if no configuration found.
                final SensorConfiguration config = configurations.containsKey(i)
                    ? configurations.get(i)         // Get configuration by sensor device ID.
                    : freeConfigurations.poll();    // Get configuration from available configurations.
                // Ensure that configuration exists.
                if (config != null) {
                    try {
                        configureSensor(i, config, configuration.erase);
                    } catch (Exception e) {
                        System.err.println("Failed to configure sensor with index " + i + ": " + e.getMessage());
                    }
                }
            }
        } finally {
            if (context != null) {
                context.close();
            }
        }
    }

    /**
     * Configures recording in opal mesh network without access point.
     * @param config APDM Configuration.
     * @throws APDMException
     */
    private static void configureRecording(ApdmConfiguration config) throws APDMException {
        Context context = null;
        try {
            context = Context.getInstance();
            context.autoConfigureMeshSync2(config.accessPoint.channel);
        } finally {
            if (context != null) {
                context.close();
            }
        }
    }

    /**
     * Configures streaming through access point.
     * @param apConfig Access Point Configuration.
     * @throws APDMException
     */
    private static void configureStreaming(ApdmApConfiguration apConfig) throws APDMException {
        Context context = null;
        try {
            context = Context.getInstance();
            // Open APDM Context.
            context.open();

            // Generate configuration for streaming.
            final apdm_streaming_config_t streamingConfig = new apdm_streaming_config_t();
            // Initialize streaming configuration.
            apdm.apdm_init_streaming_config(streamingConfig);
            // Set configured channel number.
            streamingConfig.setWireless_channel_number(apConfig.channel);
            // Set configured sampling rate.
            streamingConfig.setOutput_rate_hz(apConfig.samplingRate);

            // Apply streaming configuration using auto configure.
            context.autoConfigureDevicesAndAccessPointStreaming(streamingConfig);
        } finally {
            if (context != null) {
                context.close();
            }
        }
    }
}
