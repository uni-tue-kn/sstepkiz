package de.unituebingen.informatik.kn;

public class SensorConfiguration {
    /**
     * Constructs a new sensor configuration.
     * @param label Preferred label of sensor.
     * @param id ID of sensor. If not given, a random sensor will be applied.
     */
    public SensorConfiguration(String label, long id) {
        this.id = id;
        this.label = label.substring(0, Math.min(15, label.length()));
    }
    /**
     * Constructs a new sensor configuration.
     * @param label Preferred label of sensor.
     */
    public SensorConfiguration(String label) {
        this(label, -1);
    }
    /**
     * Constructs a new sensor configuration.
     */
    public SensorConfiguration() {
        this("");
    }

    /**
     * ID of sensor.
     */
    public final long id;

    /**
     * Label of sensor.
     */
    public final String label;
}
