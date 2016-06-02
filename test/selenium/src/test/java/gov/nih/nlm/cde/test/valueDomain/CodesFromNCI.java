package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CodesFromNCI extends NlmCdeBaseTest {

    @Test
    public void codesFromNCI() {
        goToCdeByName("Race Category Text");
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("displayNCICodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsNCI-0"));
        textPresent("C41259", By.id("codeAsNCI-0"));
        clickElement(By.id("displayUMLSCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsUMLS-0"));
        textPresent("C1515945", By.id("codeAsUMLS-0"));
        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        mustBeLoggedInAs(test_username, password);
        goToCdeByName("Race Category Text");
        clickElement(By.id("pvs_tab"));

        clickElement(By.id("displayLNCCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsLNC-0"));
        textPresent("LA10608-0", By.id("codeAsLNC-0"));

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsSCT-0"));
        textPresent("413490006", By.id("codeAsSCT-0"));
    }

}
