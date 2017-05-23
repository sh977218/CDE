package gov.nih.nlm.cde.test.permissibleValue;

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
        textPresent("Enterovirus", By.id("nameAsNCI_0"));
        textPresent("TCGA", By.id("codeAsNCI_0"));
        clickElement(By.id("displayUMLSCodes"));
        textPresent("N/A", By.id("nameAsUMLS_0"));
        textPresent("N/A", By.id("codeAsUMLS_0"));
        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        mustBeLoggedInAs(test_username, password);
        goToCdeByName("Race Category Text");
        clickElement(By.id("pvs_tab"));

        clickElement(By.id("displayLNCCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsLNC_0"));
        textPresent("LA6155-1", By.id("codeAsLNC_0"));

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textPresent("American Indian or Alaska native", By.id("nameAsSCT_0"));
        textPresent("413490006", By.id("codeAsSCT_0"));
    }

}
