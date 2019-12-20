package gov.nih.nlm.system;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public interface MAP_HELPER {
    ArrayList<String> PREDEFINED_DATATYPE = new ArrayList<String>(Arrays.asList("Value List", "Text", "Date", "Time", "Number", "Dynamic Code List", "Externally Defined", "File"));
    Map<String, String> SWAGGER_API_TYPE = new HashMap<String, String>() {
        {
            put("cdeTinyId", "operations-CDE-get_server_de__tinyId_");
            put("cdeTinyIdVersion", "operations-CDE-get_server_de__tinyId__version__version_");
            put("formTinyId", "operations-Form-get_server_form__tinyId_");
            put("formTinyIdVersion", "operations-Form-get_server_form__tinyId__version__version_");
        }
    };
    Map<String, Integer> REG_STATUS_SORT_MAP = new HashMap<String, Integer>() {
        {
            put("Retired", 6);
            put("Incomplete", 5);
            put("Candidate", 4);
            put("Recorded", 3);
            put("Qualified", 2);
            put("Standard", 1);
            put("Preferred Standard", 0);
        }
    };
}
