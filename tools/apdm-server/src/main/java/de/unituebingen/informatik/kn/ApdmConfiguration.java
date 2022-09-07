package de.unituebingen.informatik.kn;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Iterator;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class ApdmConfiguration {
    /**
     * Configuration of individual sensors.
     */
    public final SensorConfiguration[] sensors;

    /**
     * Configuration of access point.
     */
    public final ApdmApConfiguration accessPoint;

    /**
     * If logged data should be erased.
     */
    public final boolean erase;

    /**
     * If sensor data streaming is enabled.
     */
    public final boolean streaming;

    /**
     * Constructs a new empty APDM Configuration.
     */
    public ApdmConfiguration() {
        this(new SensorConfiguration[0], new ApdmApConfiguration(), false, true);
    }
    /**
     * Constructs a new APDM Configuration.
     * @param sensors Configuration of sensors.
     */
    public ApdmConfiguration(SensorConfiguration[] sensors, ApdmApConfiguration accessPoint, boolean erase, boolean streaming) {
        this.sensors = sensors;
        this.accessPoint = accessPoint;
        this.erase = erase;
        this.streaming = streaming;
    }

    /**
     * Reads and parses a new APDM Configuration instance from file.
     * @param filePath Path to configuration file.
     * @return Parsed APDM Configuration instance.
     * @throws Exception
     */
    public static ApdmConfiguration FromFile(File configFile) throws Exception {
        try {
            // Prepare parser and file access.
            final JSONParser parser = new JSONParser();
            final FileReader fr = new FileReader(configFile);
            // Parse configuration object from file.
            final Object obj = parser.parse(fr);
            return LoadConfiguration(obj);
        } catch (FileNotFoundException e) {
            throw new Exception("Configuration file '" + configFile.getPath() + "' not found!", e);
        } catch (IOException e) {
            throw new Exception("Unable to read configuration file '" + configFile.getPath() + "'!");
        } catch (Exception e) {
            throw new Exception("Parsing JSON content of configuration file '" + configFile.getPath() + "' failed: " + e.toString());
        }
    }
    public static ApdmConfiguration FromJSON(String jsonConfig) throws Exception {
        try {
            // Prepare parser.
            final JSONParser parser = new JSONParser();
            // Parse configuration object json string.
            final Object obj = parser.parse(jsonConfig);
            return LoadConfiguration(obj);
        } catch (Exception e) {
            throw new Exception("Parsing JSON string '" + jsonConfig + "' failed: " + e.toString());
        }
    }
    private static SensorConfiguration[] LoadApdmSensorConfiguration(JSONObject config) {
        // Return empty array if sensors parameter not found.
        if (!config.containsKey("sensors")) {
            return new SensorConfiguration[0];
        }
        // Get array of sensors.
        final JSONArray jsonSensors = (JSONArray)config.get("sensors");
        // Prepare parsed array of sensor configurations.
        final int sensorCount = jsonSensors.size();
        final SensorConfiguration[] sensors = new SensorConfiguration[sensorCount];
        // Fill array of sensor configurations.
        int i = 0;
        final Iterator<?> jsonSensorsIterator = jsonSensors.iterator();
        while(jsonSensorsIterator.hasNext() && i < sensorCount) {
            // Get properties of sensor configuration.
            final JSONObject jsonSensor = (JSONObject)jsonSensorsIterator.next();
            final String label = jsonSensor.containsKey("label") ? (String)jsonSensor.get("label") : "";
            final long id = jsonSensor.containsKey("id") ? (long)jsonSensor.get("id") : -1L;
            // Create parsed sensor configuration.
            final SensorConfiguration sensor = new SensorConfiguration(label, id);
            sensors[i] = sensor;
            // Iterate to next sensor configuration.
            i++;
        }
        return sensors;
    }
    private static ApdmApConfiguration LoadApConfiguration(JSONObject config) throws Exception {
        if (config.containsKey("ap")) {
            final JSONObject jsonApConfig = (JSONObject)config.get("ap");
            final short channel = (short)Math.toIntExact(jsonApConfig.containsKey("ch") ? (long)jsonApConfig.get("ch") : 60L);
            final long samplingRate = jsonApConfig.containsKey("sampling_rate") ? (long)jsonApConfig.get("sampling_rate") : 128L;
            return new ApdmApConfiguration(channel, samplingRate);
        } else {
            return new ApdmApConfiguration();
        }
    }
    private static ApdmConfiguration LoadConfiguration(Object obj) throws Exception {
        try {
            final JSONObject jsonConfig = (JSONObject)obj;
            // Load sensor configuration.
            final SensorConfiguration[] sensors = LoadApdmSensorConfiguration(jsonConfig);
            // Load access point configuration.
            final ApdmApConfiguration apConfig = LoadApConfiguration(jsonConfig);
            final boolean erase = jsonConfig.containsKey("erase") ? (boolean)jsonConfig.get("erase") : false;
            final boolean streaming = jsonConfig.containsKey("streaming") ? (boolean)jsonConfig.get("streaming") : false;
            // Create parsed APDM Configuration instance and return it.
            final ApdmConfiguration configuration = new ApdmConfiguration(sensors, apConfig, erase, streaming);
            return configuration;
        } catch (Exception e) {
            throw new Exception("Failed to parse APDM configuration: " + e.getMessage());
        }
    }
}
