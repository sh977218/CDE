package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CodesFromNCI extends NlmCdeBaseTest {

    @Test
    public void codesFromNCI() {
        String cdeName = "Race Category Text";
        goToCdeByName(cdeName);
        goToDataTypeDetails();
        clickElement(By.id("displayNCICodes"));
        textPresent("Alaska Native", By.id("nameAsNCI_0"));
        textPresent("C41259", By.id("codeAsNCI_0"));
        clickElement(By.id("displayUMLSCodes"));
        textPresent("American Indian", By.id("nameAsUMLS_0"));
        textPresent("C1515945", By.id("codeAsUMLS_0"));
        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        mustBeLoggedInAs(test_username, password);
        goToCdeByName("Race Category Text");
        goToDataTypeDetails();

        clickElement(By.id("displayLNCCodes"));
        textPresent("American Indian or Alaska Native", By.id("nameAsLNC_0"));
        textPresent("LA6155-1", By.id("codeAsLNC_0"));
        textNotPresent("Retrieving...");

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textPresent("American Indian or Alaska native", By.id("nameAsSCT_0"));
        textPresent("413490006", By.id("codeAsSCT_0"));
    }

}
