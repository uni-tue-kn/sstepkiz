package de.unituebingen.informatik.kn;

import java.net.InetAddress;
import java.net.UnknownHostException;

public class Endpoint {

    private InetAddress host;
    public InetAddress GetHost() {
        return this.host;
    }
    public void SetHost(InetAddress address) {
        this.host = address;
    }
    public void SetHost(String address) throws Exception {
        try {
            this.SetHost(InetAddress.getByName(address));
        } catch (UnknownHostException e) {
            throw new Exception("Failed to parse get address \"" + "\"!");
        }
    }

    private int port;
    public int GetPort() {
        return this.port;
    }
    public void SetPort(int port) {
        this.port = port;
    }
    public void SetPort(String port) throws Exception {
        try {
            this.SetPort(Integer.parseInt(port));
        } catch (NumberFormatException e) {
            throw new Exception("Failed to parse target port \"" + port + "\"!");
        }
    }

    public Endpoint() {

    }
    public Endpoint(InetAddress address, int port) {
        this();
        this.SetHost(address);
        this.SetPort(port);
    }

    public static Endpoint FromString(String endpoint, InetAddress defaultHost, int defaultPort) throws Exception {
        Endpoint ep = new Endpoint();
        if (endpoint.length() > 0) {
            if (endpoint.startsWith(":")) {
                ep.SetPort(endpoint.substring(1));
                ep.SetHost(defaultHost);
            } else {
                int index = endpoint.lastIndexOf(":");
                if (index > 0) {
                    if (endpoint.lastIndexOf("]") > index) {
                        ep.SetHost(endpoint);
                        ep.SetPort(defaultPort);
                    } else {
                        ep.SetPort(endpoint.substring(index + 1));
                        ep.SetHost(endpoint.substring(0, index));
                    }
                } else {
                    ep.SetHost(endpoint);
                    ep.SetPort(defaultPort);
                }
            }
        } else {
            ep.SetHost(defaultHost);
            ep.SetPort(defaultPort);
        }
        return ep;
    }
}
