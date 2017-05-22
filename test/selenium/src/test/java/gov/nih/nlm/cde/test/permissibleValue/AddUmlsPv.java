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
        clickElement(By.id("openAddPermissibleValueModelBtn"));
        clickElement(By.id("valueMeaningNameInput"));
        findElement(By.id("valueMeaningNameInput")).sendKeys("Female");
        textPresent("Choices from UMLS");
        textPresent("C0086287 : Females");
        clickElement(By.linkText("C0086287 : Females"));
        clickElement(By.id("createNewPermissibleValueBtn"));
        textPresent("C0015780", By.id("pvMeaningCode_5"));

        clickElement(By.id("displayNCICodes"));
        textPresent("Female", By.id("nameAsNCI_5"));
        textPresent("C16576", By.id("codeAsNCI_5"));

        clickElement(By.id("displayLNCCodes"));
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("LA3-6", By.id("codeAsLNC_5"));

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textPresent("Female", By.id("nameAsSCT_5"));
        textPresent("248152002", By.id("codeAsSCT_5"));

        newCdeVersion();
        textPresent("Female", By.id("nameAsNCI_5"));
        textPresent("C16576", By.id("codeAsNCI_5"));
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("LA3-6", By.id("codeAsLNC_5"));
        textPresent("Female", By.id("nameAsSCT_5"));
        textPresent("248152002", By.id("codeAsSCT_5"));

        mustBeLoggedOut();
        goToCdeByName("Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator");
        clickElement(By.id("pvs_tab"));

        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        clickElement(By.id("displayNCICodes"));
        textPresent("Female", By.id("nameAsNCI-5"));
        textPresent("C16576", By.id("codeAsNCI-5"));
    }

}
