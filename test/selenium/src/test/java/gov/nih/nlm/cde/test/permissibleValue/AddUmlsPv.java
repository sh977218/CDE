package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddUmlsPv extends NlmCdeBaseTest {

    @Test
    public void addUmlsPv() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName("Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator");
        clickElement(By.id("pvs_tab"));
        clickElement(By.partialLinkText("Add Permissible Value"));
        clickElement(By.id("valueMeaningNameInput"));
        findElement(By.id("valueMeaningNameInput")).sendKeys("Female");
        textPresent("Choices from UMLS");
        textPresent("C0015780 : Female");
        textPresent("C0086287 : Females");
        clickElement(By.linkText("C0015780 : Female"));
        clickElement(By.id("createNewPv"));
        textPresent("C0015780", By.id("pvCode-5"));

        findElement(By.id("displayNCICodes")).click();
        textPresent("Female", By.id("nameAsNCI-5"));
        textPresent("C16576", By.id("codeAsNCI-5"));

        findElement(By.id("displayLNCCodes")).click();
        textPresent("Female", By.id("nameAsLNC-5"));
        textPresent("LA3-6", By.id("codeAsLNC-5"));

        findElement(By.id("displaySNOMEDCT_USCodes")).click();
        textPresent("Female", By.id("nameAsSCT-5"));
        textPresent("248152002", By.id("codeAsSCT-5"));

        newCdeVersion();
        textPresent("Female", By.id("nameAsNCI-5"));
        textPresent("C16576", By.id("codeAsNCI-5"));
        textPresent("Female", By.id("nameAsLNC-5"));
        textPresent("LA3-6", By.id("codeAsLNC-5"));
        textPresent("Female", By.id("nameAsSCT-5"));
        textPresent("248152002", By.id("codeAsSCT-5"));

        mustBeLoggedOut();
        goToCdeByName("Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator");
        clickElement(By.id("pvs_tab"));

        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        findElement(By.id("displayNCICodes")).click();
        textPresent("Female", By.id("nameAsNCI-5"));
        textPresent("C16576", By.id("codeAsNCI-5"));
    }

}
