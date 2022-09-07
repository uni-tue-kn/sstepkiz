package de.unituebingen.informatik.kn;

import com.apdm.swig.APDM_Status;
import com.apdm.swig.apdm;
import com.apdm.swig.apdm_file_conversion_parameter_t;

public class ApdmFileConverter {

    /**
     * Converts multiple .apdm files to a .h5 file.
     * @param sources Array of .apdm source file paths.
     * @param target File path of target .h5 file.
     * @throws Exception Conversion failed.
     */
    public static void convertHdf5(String[] sources, String target) throws Exception {
        // Create new conversion parameters.
        apdm_file_conversion_parameter_t cp = new apdm_file_conversion_parameter_t();

        // Apply target format, source and target files.
        cp.setFormat_hdf(true);
        cp.setFile_out(target);
        cp.setFiles_to_convert(sources);
        cp.setNFiles(sources.length);

        // Apply additional conversion parameters.
        cp.setCompress(true);
        cp.setStore_raw(true);
        cp.setStore_si(true);
        cp.setStore_unsynchronized(false);

        // Start conversion process.
        int result = apdm.apdm_process_raw3(cp);

        // Evaluate processing result.
        APDM_Status status = APDM_Status.swigToEnum(result);
        if (status.compareTo(APDM_Status.APDM_OK) != 0) {
            throw new Exception("Failed to convert raw data files to HDF5: " + status.name());
        }
    }
}
