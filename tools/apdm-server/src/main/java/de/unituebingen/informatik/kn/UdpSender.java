package de.unituebingen.informatik.kn;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class UdpSender {
    /**
     * Used UDP client socket.
     */
    private DatagramSocket client;

    /**
     * List of target endpoints.
     */
    private List<Endpoint> endpoints = new ArrayList<Endpoint>();
    /**
     * Gets all endpoints to send data to.
     * @return Array of endpoints.
     */
    public Endpoint[] GetEndpoints() {
        return this.endpoints.toArray(new Endpoint[this.endpoints.size()]);
    }
    /**
     * Sets all endpoints to send data to.
     * @param endpoints Endpoints to send data to.
     */
    public void SetEndpoints(Endpoint[] endpoints) {
        this.endpoints.clear();
        for (Endpoint ep: endpoints) {
            this.endpoints.add(ep);
        }
    }
    /**
     * Adds an endpoint to send data to.
     * @param endpoint Endpoint to add.
     */
    public void AddEndpoint(Endpoint endpoint) {
        this.endpoints.add(endpoint);
    }
    /**
     * Removes an endpoint to send data to.
     * @param endpoint Endpoint to remove.
     */
    public void RemoveEndpoint(Endpoint endpoint) {
        this.endpoints.remove(endpoint);
    }

    /**
     * Constructs a new UDP Sender object.
     * @throws Exception
     */
    public UdpSender() throws Exception {
        try {
            this.client = new DatagramSocket();
        } catch (SocketException e) {
            throw new Exception("Failed to initialize UDP socket: " + e.getMessage());
        }
    }
    /**
     * Constructs a new UDP Sender object.
     * @param endpoint Endpoint to send data to.
     * @throws Exception
     */
    public UdpSender(Endpoint endpoint) throws Exception {
        this();
        this.AddEndpoint(endpoint);
    }
    /**
     * Constructs a new UDP Sender object.
     * @param endpoints All endpoints to send data to.
     * @throws Exception
     */
    public UdpSender(Endpoint[] endpoints) throws Exception {
        this();
        this.SetEndpoints(endpoints);
    }

    /**
     * Closes the socket.
     */
    public void Close() {
        this.client.close();
    }

    /**
     * Sends data to a UDP server.
     * @param buffer Buffer with data to send.
     */
    public void Send(byte[] buffer) throws Exception {
        Endpoint[] endpoints = this.GetEndpoints();
        for (Endpoint ep : endpoints) {
            DatagramPacket datagram = new DatagramPacket(buffer, buffer.length, ep.GetHost(), ep.GetPort());
            try {
                this.client.send(datagram);
            } catch (IOException e) {
                System.err.println("Failed to send data to \"" + ep.GetHost().toString() + ":" + ep.GetPort() + "\": " + e.getMessage());
            }
        }
    }
    /**
     * Sends data to a UDP server.
     * @param data String data to send.
     * @throws Exception
     */
    public void Send(String data) throws Exception {
        byte[] buffer = data.getBytes(StandardCharsets.UTF_8);
        this.Send(buffer);
    }
}
