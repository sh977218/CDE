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
        selectMatSelect("", "Select Precision", "Year");
        selectMatSelect("", "Select Precision", "Month");
        selectMatSelect("", "Select Precision", "Day");
        selectMatSelect("", "Select Precision", "Hour");
        selectMatSelect("", "Select Precision", "Minute");
        selectMatSelect("", "Select Precision", "Second");
    }
}
