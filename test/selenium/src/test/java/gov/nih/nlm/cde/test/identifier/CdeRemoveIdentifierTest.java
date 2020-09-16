package gov.nih.nlm.cde.test.identifier;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CdeRemoveIdentifierTest extends NlmCdeBaseTest {
    @Test
    public void cdeRemoveIdentifier() {
        String cdeName = "Malignant Neoplasm Surgical Margin Distance Value";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        removeIdentifier(0);

        goToCdeByName(cdeName);
        goToIdentifiers();
        textNotPresent("caDSR", By.id("identifiers-div"));
        textNotPresent("2682865", By.id("identifiers-div"));
    }
}