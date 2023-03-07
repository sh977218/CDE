package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class DateDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void dateDatatype() {
        String cdeName = "Assessment date and time";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        selectMatSelectByPlaceholder("", "Select Precision", "Year");
        selectMatSelectByPlaceholder("", "Select Precision", "Month");
        selectMatSelectByPlaceholder("", "Select Precision", "Day");
        selectMatSelectByPlaceholder("", "Select Precision", "Hour");
        selectMatSelectByPlaceholder("", "Select Precision", "Minute");
        selectMatSelectByPlaceholder("", "Select Precision", "Second");
    }
}
