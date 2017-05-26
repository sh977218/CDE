package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HideProprietaryPv extends NlmCdeBaseTest {

    private PvValidatorTest pvValidator = new PvValidatorTest();

    @Test
    public void hideProprietaryPv() {
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.id("pvs_tab"));

        pvValidator.addPv("pv1", "name1", "code1", "SNOMEDCT");

        newCdeVersion();

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.linkText("Permissible Values"));
        textPresent("SNOMEDCT");

        logout();
        goToCdeByName("Post traumatic amnesia duration range");
        clickElement(By.id("pvs_tab"));
        textNotPresent("SNOMEDCT");
        textPresent("Login to see the value.");
    }

}
