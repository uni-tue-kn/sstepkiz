package de.unituebingen.informatik.kn;

import com.apdm.APDMNoMoreDataException;
import com.apdm.Context;
import com.apdm.RecordRaw;

import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class ApdmStreamer {

    public static void Stream(UdpSender sender, boolean verbose) throws Exception {
        // Get instance of APDM device context.
        Context context = Context.getInstance();

        try {
            // Open Access Point.
            context.open();

            int max_latency_seconds = 0xffff;
 
            // Set the max latency to something small to flush any existing data buffered on the monitors
            context.setMaxLatency(0);
            // Wait a little bit to give the monitors time to receive the command and process it.
            Thread.sleep(3000);

            // Set the max latency time back to something big.
            // This will force the AP to process old packets if the sensors go out of range of the AP
            context.setMaxLatency(max_latency_seconds);
            // Wait a little bit for the max latency command to take effect
            Thread.sleep(3000);

            // Sync the record head list. This is a method in the host libraries which waits to correlate data from
            // all streaming devices before emitting correlated sets of data.
            context.syncRecordHeadList();

            // Call this many times to stream data
            while (true) {
                try {
                    final List<RecordRaw> records = context.getNextRecordList();
                    final JSONArray dataList = new JSONArray();
                    for (RecordRaw rec : records) {
                        final HashMap<String, Object> recordMap = new HashMap<String, Object>();
                        final HashMap<String, Double> aMap = new HashMap<String, Double>();
                        aMap.put("x", rec.record.getAccl_x_axis_si());
                        aMap.put("y", rec.record.getAccl_y_axis_si());
                        aMap.put("z", rec.record.getAccl_z_axis_si());
                        final JSONObject a = new JSONObject(aMap);
                        recordMap.put("a", a);
                        final HashMap<String, Double> mMap = new HashMap<String, Double>();
                        mMap.put("x", rec.record.getMag_x_axis_si());
                        mMap.put("y", rec.record.getMag_y_axis_si());
                        mMap.put("z", rec.record.getMag_z_axis_si());
                        final JSONObject m = new JSONObject(mMap);
                        recordMap.put("m", m);
                        recordMap.put("p", rec.record.getPressure_si());
                        recordMap.put("tp", rec.record.getTemperature_si());
                        recordMap.put("t", (new Date()).getTime());
                        recordMap.put("id", rec.record.getDevice_info_serial_number());
                        final JSONObject record = new JSONObject(recordMap);
                        dataList.add(record);
                    }
                    final String jsonData = dataList.toJSONString();
                    if (verbose) {
                        System.out.println(jsonData);
                    }
                    sender.Send(jsonData);
                } catch (APDMNoMoreDataException ex) {
                    // No data found, so wait just a bit for data to become available.
                    Thread.sleep(100);
                }
            }
        } finally {
            if (context != null) {
                context.close();
            }
        }
    }
}
