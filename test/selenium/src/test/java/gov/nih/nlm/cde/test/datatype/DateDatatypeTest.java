package gov.nih.nlm.cde.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DateDatatypeTest extends NlmCdeBaseTest {
    @Test
    public void dateDatatype() {
        String cdeName = "Assessment date and time";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        nonNativeSelect("", "Select Precision", "Year");
        nonNativeSelect("", "Select Precision", "Month");
        nonNativeSelect("", "Select Precision", "Day");
        nonNativeSelect("", "Select Precision", "Hour");
        nonNativeSelect("", "Select Precision", "Minute");
        nonNativeSelect("", "Select Precision", "Second");
    }
}
