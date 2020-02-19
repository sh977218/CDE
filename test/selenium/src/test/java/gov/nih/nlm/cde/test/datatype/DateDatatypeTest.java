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

        clickElement(By.id("datatypeDatePrecision"));
        selectMatSelectDropdownByText("Month");
        textPresent("Month");

        clickElement(By.id("datatypeDatePrecision"));
        selectMatSelectDropdownByText("Day");
        textPresent("Day");

        clickElement(By.id("datatypeDatePrecision"));
        selectMatSelectDropdownByText("Hour");
        textPresent("Hour");

        clickElement(By.id("datatypeDatePrecision"));
        selectMatSelectDropdownByText("Minute");
        textPresent("Minute");

        clickElement(By.id("datatypeDatePrecision"));
        selectMatSelectDropdownByText("Second");
        textPresent("Second");
    }
}
