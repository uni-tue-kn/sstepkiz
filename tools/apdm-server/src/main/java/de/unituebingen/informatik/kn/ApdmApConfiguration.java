package de.unituebingen.informatik.kn;

public class ApdmApConfiguration {
    /**
     * Wireless channel.
     * Default: 60.
     * Valid values: 10, 20, 30, 40, 50, 60, 70, 80.
     */
    public final short channel;

    /**
     * Sampling rate in hz.
     * Default: 128.
     * Valid values: 20, 32, 40, 64, 80, 128.
     */
    public final long samplingRate;

    /**
     * Constructs a new default APDM Access Point configuration.
     */
    public ApdmApConfiguration() {
        this.channel = 60;
        this.samplingRate = 128;
    }
    /**
     * Constructs a new custom ADPM Access Point configuration.
     * @param channel Wireless channel.
     * @param samplingRate Sampling rate.
     */
    public ApdmApConfiguration(short channel, long samplingRate) throws Exception {
        if (channel == 10 || channel == 20 || channel == 30 || channel == 40 || channel == 50 || channel == 60 || channel == 70 || channel == 80) {
            this.channel = channel;
        } else {
            throw new Exception("Invalid channel of " + channel + "! Must be one of 10, 20, 30, 40, 50, 60, 70, or 80");
        }
        if (samplingRate == 20 || samplingRate == 32 || samplingRate == 40 || samplingRate == 64 || samplingRate == 80 || samplingRate == 128) {
            this.samplingRate = samplingRate;
        } else {
            throw new Exception("Invalid sampling rate of " + samplingRate + "! Must be one of 20, 32, 40, 64, 80, or 128");
        }
    }
}
