package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LoincLinkTest extends NlmCdeBaseTest {
    @Test
    public void loincLink() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Ethnicity USA maternal category");
        goToIdentifiers();
        addNewIdentifier("LOINC", "59362-4");
        findElement(By.linkText("59362-4"));
    }
}
