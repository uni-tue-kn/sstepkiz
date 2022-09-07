package de.unituebingen.informatik.kn;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CliConfiguration {

    /**
     * Default configuration file.
     */
    public static final String DEFAULT_CONFIG_FILE = "./apdm-config.json";

    /**
     * Default configuration.
     */
    public static final String DEFAULT_CONFIG = "{\"sensors\":[{\"id\":-1,\"label\":\"Lumbar\"}]}";

    /**
     * Default log file.
     */
    public static final String DEFAULT_LOG_FILE = "./apdm.log";
    
    /**
     * Default port to send data to.
     */
    public static final int DEFAULT_PORT = 5000;

    private ApdmConfiguration configuration = null;
    public ApdmConfiguration GetSensorConfiguration() {
        return this.configuration;
    }
    /**
     * Sets the configuration as JSON string.
     * @param jsonConfig JSON string of configuration.
     */
    public void SetConfig(String jsonConfig) throws Exception {
        this.configuration = ApdmConfiguration.FromJSON(jsonConfig);
    }
    /**
     * Sets the configuration from file.
     * @param file Configuration file instance.
     * @throws FileNotFoundException
     */
    public void SetConfigFile(File file) throws FileNotFoundException, Exception {
        if (file == null || file.exists()) {
            this.configuration = ApdmConfiguration.FromFile(file);
        } else {
            throw new FileNotFoundException("Configuration file \"" + file.getPath() + "\" does not exist!");
        }
    }
    /**
     * Sets the configuration from file.
     * @param fileName Path to configuration file.
     * @throws FileNotFoundException
     */
    public void SetConfigFile(String fileName) throws FileNotFoundException, Exception {
        this.SetConfigFile(new File(fileName));
    }

    private boolean IsConfiguring = false;
    /**
     * Gets if sensors should be configured and a configuration file is given.
     * @return true = yes, false = no.
     */
    public boolean GetIsConfiguring() {
        return this.IsConfiguring && this.configuration != null;
    }
    /**
     * Sets if sensors should be configured.
     * @param isConfiguring true = yes, false = no.
     */
    public void SetIsConfiguring(boolean isConfiguring) {
        this.IsConfiguring = isConfiguring;
    }

    private boolean IsProcessing = false;
    /**
     * Gets if raw .apdm files should be converted to .h5 files.
     * @return true = yes, false = no.
     */
    public boolean GetIsProcessing() {
        return this.IsProcessing;
    }
    /**
     * Sets if raw .apdm files should be converted to .h5 files.
     * @param isProcessing true = yes, false = no.
     */
    public void SetIsProcessing(boolean isProcessing) {
        this.IsProcessing = isProcessing;
    }

    private String[] SourceFiles = null;
    /**
     * Gets the source file paths for file conversion.
     * @return Source file paths.
     */
    public String[] GetSourceFiles() {
        return this.SourceFiles;
    }
    /**
     * Sets the source file paths for file conversion.
     * @param sourceFiles Source file paths.
     * @throws FileNotFoundException One or more files not found.
     */
    public void SetSourceFiles(String[] sourceFiles) throws FileNotFoundException {
        for (String sourceFile : sourceFiles) {
            System.out.println("Testing file \"" + sourceFile + "\"...");
            File file = new File(sourceFile);
            if (!file.exists() || file.isDirectory()) {
                throw new FileNotFoundException("Source file \"" + sourceFile + "\" was not found or is a directory!");
            }
        }
        this.SourceFiles = sourceFiles;
    }

    private String TargetFile = null;
    /**
     * Gets the target file path for file conversion.
     * @return Target file path.
     */
    public String GetTargetFile() {
        return this.TargetFile;
    }
    /**
     * Sets the target file path for file conversion.
     * @param targetFile Target file path.
     */
    public void SetTargetFile(String targetFile) {
        this.TargetFile = targetFile;
    }

    private boolean IsStreaming = false;
    /**
     * Gets if sensor data should be streamed.
     * @return true = yes, false = no.
     */
    public boolean GetIsStreaming() {
        return this.IsStreaming;
    }
    /**
     * Sets if sensor data should be streamed.
     * @param isStreaming true = yes, false = no.
     */
    public void SetIsStreaming(boolean isStreaming) {
        this.IsStreaming = isStreaming;
    }

    private File LogFile = new File(DEFAULT_LOG_FILE);
    /**
     * Gets the log file.
     * @return Set log file.
     */
    public File GetLogFile() {
        return this.LogFile;
    }
    /**
     * Sets the log file.
     * @param file Log file instance.
     * @throws Exception
     */
    public void SetLogFile(File file) throws Exception {
        if (file != null && !file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                throw new Exception("Failed to create log file \"" + file.getParent() + "\"!");
            }
        }
        this.LogFile = file;
    }
    /**
     * Sets the log file.
     * @param fileName Path of log file.
     * @throws Exception
     */
    public void SetLogFile(String fileName) throws Exception {
        this.SetLogFile(new File(fileName));
    }

    private boolean isLogging = false;
    /**
     * Gets if logging is enabled.
     * @return true = yes, false = no.
     */
    public boolean GetIsLogging() {
        return this.isLogging;
    }
    /**
     * Sets if logging is enabled.
     * @param isLogging true = yes, false = no.
     */
    public void SetIsLogging(boolean isLogging) {
        this.isLogging = isLogging;
    }

    private boolean isVerbose = false;
    /**
     * Gets if logging is verbose.
     * @return true = yes, false = no.
     */
    public boolean GetIsVerbose() {
        return this.isVerbose;
    }
    /**
     * Sets if logging is verbose.
     * @param isVerbose true = yes, false = no.
     */
    public void SetIsVerbose(boolean isVerbose) {
        this.isVerbose = isVerbose;
    }

    private List<Endpoint> endpoints = new ArrayList<Endpoint>();
    /**
     * Gets a list of all UDP endpoints to stream data to. 
     * @return List of all UDP endpoints.
     */
    public Endpoint[] GetEndpoints() {
        return this.endpoints.toArray(new Endpoint[endpoints.size()]);
    }
    /**
     * Sets the UDP endpoints to stream data to.
     * @param endpoints Endpoint instances to stream data to.
     */
    public void SetEndpoints(Endpoint[] endpoints) {
        this.endpoints.clear();
        for (Endpoint ep : endpoints) {
            this.AddEndpoint(ep);
        }
    }
    /**
     * Sets the UDP endpoints to stream data to.
     * @param endpoints Array of string encoded endpoints.
     * @throws Exception
     */
    public void SetEndpoints(String[] endpoints) throws Exception {
        for (String ep: endpoints) {
            this.AddEndpoint(Endpoint.FromString(ep, InetAddress.getLoopbackAddress(), DEFAULT_PORT));
        }
    }
    /**
     * Sets the UDP endpoints to stream data to.
     * @param endpoints String encoded, comma-separated endpoints.
     * @throws Exception
     */
    public void SetEndpoints(String endpoints) throws Exception {
        this.SetEndpoints(endpoints.split(","));
    }
    /**
     * Adds an endpoint to stream data to.
     * @param endpoint Endpoint instance to add.
     */
    public void AddEndpoint(Endpoint endpoint) {
        this.endpoints.add(endpoint);
    }
    /**
     * Removes an endpoint instance from endpoints to stream data to.
     * @param endpoint Endpoint to remove.
     */
    public void RemoveEndpoint(Endpoint endpoint) {
        this.endpoints.remove(endpoint);
    }

    /**
     * Gets a configuration from command line arguments.
     * @param args Command line arguments.
     * @return Configuration instance generated from command line arguments.
     * @throws Exception
     */
    public static CliConfiguration GetFromCliArguments(String[] args) throws Exception {
        // Get commands (arguments that start with '-') and its parameters (the arguments after the command).
        List<String[]> commands = new ArrayList<String[]>();
        for (int i = 0; i < args.length; i++) {
            if (args[i].startsWith("-")) {
                int j;
                for (j = i + 1; j < args.length; j++) {
                    if (args[j].startsWith("-")) {
                        break;
                    }
                }
                String[] cmd = new String[j - i];
                for (j = 0; j < cmd.length; j++) {
                    cmd[j] = args[i + j];
                }
                commands.add(cmd);
                i += j - 1;
            } else {
                continue;
            }
        }

        // Parse the configuration.
        CliConfiguration config = new CliConfiguration();
        for (String[] cmd : commands) {
            String commandName = cmd[0];
            String[] parameters = new String[cmd.length - 1];
            for (int i = 1; i < cmd.length; i++) {
                parameters[i - 1] = cmd[i];
            }
            switch (commandName) {
                case "-c":
                case "--configure":
                    config.SetIsConfiguring(true);
                    if (parameters.length == 0) {
                        config.SetConfigFile(DEFAULT_CONFIG_FILE);
                    } else {
                        for (int i = 0; i < parameters.length; i++) {
                            switch (i) {
                                case 0:
                                    config.SetConfigFile(parameters[0]);
                                    break;
                                default:
                                    System.out.println("Invalid configure parameter \"" + parameters[i] + "\" will be ignored");
                                    break;
                            }
                        }
                    }
                    break;

                case "-p":
                case "--process":
                    config.SetIsProcessing(true);
                    if (parameters.length < 2) {
                        throw new Exception("Parameter " + commandName + " requires at least 2 file paths");
                    }
                    String targetFile = parameters[parameters.length - 1];
                    String[] sourceFiles = Arrays.copyOfRange(parameters, 0, parameters.length - 1);
                    config.SetTargetFile(targetFile);
                    try {
                        config.SetSourceFiles(sourceFiles);
                    } catch (FileNotFoundException e) {
                        throw new Exception("Failed to apply source files: " + e.getMessage(), e);
                    }
                    break;

                case "-s":
                case "--stream":
                    config.SetIsStreaming(true);
                    for (int i = 0; i < parameters.length; i++) {
                        switch (i) {
                            case 0:
                                config.SetEndpoints(parameters[0]);
                                break;
                            default:
                                System.out.println("Invalid stream parameter \"" + parameters[i] + "\" will be ignored");
                                break;
                        }
                    }
                    break;

                case "-l":
                case "--log":
                case "--logfile":
                    config.SetIsLogging(true);
                    for (int i = 0; i < parameters.length; i++) {
                        switch (i) {
                            case 0:
                                config.SetLogFile(parameters[0]);
                                break;
                            default:
                                System.out.println("Invalid log parameter \"" + parameters[i] + "\" will be ignored");
                                break;
                        }
                    }
                    break;

                case "-v":
                case "--verbose":
                    config.SetIsVerbose(true);
                    break;

                default:
                    System.out.println("Unknown parameter \"" + commandName + "\" will be ignored");
                    break;
            }
        }
        return config;
    }
}
