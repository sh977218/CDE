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
        clickElement(By.id("datatypeDatePrecision"));

        selectMatSelectDropdownByText("Year");
        textPresent("Year");
        selectMatSelectDropdownByText("Month");
        textPresent("Month");
        selectMatSelectDropdownByText("Day");
        textPresent("Day");
        selectMatSelectDropdownByText("Hour");
        textPresent("Hour");
        selectMatSelectDropdownByText("Minute");
        textPresent("Minute");
        selectMatSelectDropdownByText("Second");
        textPresent("Second");
    }
}
