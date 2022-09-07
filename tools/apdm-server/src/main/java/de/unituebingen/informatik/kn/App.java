package de.unituebingen.informatik.kn;

import com.apdm.APDMException;
import com.apdm.Context;
import com.apdm.swig.apdm;
import com.apdm.swig.apdm_logging_level_t;

public final class App {

    private App() {}

    /**
     * Says hello to the world.
     * @param args The arguments of the program.
     */
    public static void main(String[] args) {
        try {
            System.out.println("Starting APDM Server...");

            Context.setLoggingLevel(apdm_logging_level_t.APDM_LL_ERROR);
            String logFile = System.getenv("USERPROFILE") + "/log.txt";
            apdm.apdm_set_log_file(logFile);
            System.out.println("Logging to \"" + logFile + "\"...");

            // Parse CLI parameters.
            CliConfiguration config;
            try {
                config = CliConfiguration.GetFromCliArguments(args);
            } catch (Exception e) {
                throw new Exception("Failed to load command line parameters: " + e.getMessage());
            }

            // Configure logging.
            if (config.GetIsLogging()) {
                try {
                    Context.setLoggingLevel(apdm_logging_level_t.APDM_LL_ALL);
                } catch (APDMException e) {
                    throw new Exception("Failed to set log level: " + e.getMessage());
                }
                apdm.apdm_set_log_file(config.GetLogFile().getPath());
            } else {
                try {
                    Context.setLoggingLevel(apdm_logging_level_t.APDM_LL_NONE);
                } catch (APDMException e) {
                    throw new Exception("Failed to set log level off: " + e.getMessage());
                }
            }

            // Configure sensors.
            if (config.GetIsConfiguring()) {
                System.out.println("Starting sensor configuration...");
                try {
                    ApdmConfigurator.Configure(config.GetSensorConfiguration());
                } catch (Exception e) {
                    throw new Exception("Configuration failed: " + e.getMessage());
                }
                System.out.println("Sensor configuration finished");
            }

            // Wait for user input, if sensors were just configured and need to be plugged out for streaming.
            if (config.GetIsConfiguring() && config.GetIsStreaming()) {
                System.out.println("Please remove movement sensors from their docks and press enter...");
                System.in.read();
            }

            // Stream sensor data.
            if (config.GetIsStreaming()) {
                System.out.println("Starting streaming...");
                try {
                    UdpSender sender = new UdpSender(config.GetEndpoints());
                    ApdmStreamer.Stream(sender, config.GetIsVerbose());
                } catch (Exception e) {
                    throw new Exception("Streaming failed: " + e.getMessage());
                }
                System.out.println("Streaming stopped");
            }

            // Convert files.
            if (config.GetIsProcessing()) {
                System.out.println("Starting file conversion...");
                // Start conversion. Exception will be caught by the end of this function.
                ApdmFileConverter.convertHdf5(config.GetSourceFiles(), config.GetTargetFile());
                System.out.println("File conversion successful");
            }

            System.out.println("APDM Server stopped");
            System.exit(0);
        } catch (Exception e) {
            System.err.println("An error has occurred: " + e.getMessage());
            System.exit(-1);
        }
    }
}
