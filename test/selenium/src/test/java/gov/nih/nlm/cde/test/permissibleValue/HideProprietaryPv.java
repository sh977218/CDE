package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HideProprietaryPv extends NlmCdeBaseTest {

    private PvValidatorTest pvValidator = new PvValidatorTest();

    @Test
    public void hideProprietaryPv() {
        String cdeName = "Post traumatic amnesia duration range";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        pvValidator.addPv("pv1", "name1", "code1", "SNOMEDCT");
        newCdeVersion();

        logout();
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        textNotPresent("SNOMEDCT");
        textPresent("Login to see the value.");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.linkText("Data Type Details"));
        textPresent("SNOMEDCT");
    }

}
