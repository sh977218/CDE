package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddUmlsPv extends NlmCdeBaseTest {

    @Test
    public void addUmlsPv() {
        String cdeName = "Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));
        clickElement(By.id("openAddPermissibleValueModelBtn"));
        clickElement(By.id("valueMeaningNameInput"));
        findElement(By.id("valueMeaningNameInput")).sendKeys("Female");
        textPresent("Choices from UMLS");
        textPresent("C0086287 : Females");
        clickElement(By.linkText("C0086287 : Females"));
        clickElement(By.id("createNewPermissibleValueBtn"));
        textPresent("C0086287", By.id("pvMeaningCode_5"));

        clickElement(By.id("displayNCICodes"));
        textPresent("Female Gender, Self Reported", By.id("nameAsNCI_5"));
        textPresent("A10805030", By.id("codeAsNCI_5"));

        clickElement(By.id("displayLNCCodes"));
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("A24095561", By.id("codeAsLNC_5"));

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textPresent("Female", By.id("nameAsSCT_5"));
        textPresent("A2881557", By.id("codeAsSCT_5"));

        newCdeVersion();
        textPresent("Female Gender, Self Reported", By.id("nameAsNCI_5"));
        textPresent("A10805030", By.id("codeAsNCI_5"));
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("A24095561", By.id("codeAsLNC_5"));
        textPresent("Female structure (body structure)", By.id("nameAsSCT_5"));
        textPresent("A3453355", By.id("codeAsSCT_5"));

        mustBeLoggedOut();
        goToCdeByName(cdeName);
        clickElement(By.id("pvs_tab"));

        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        clickElement(By.id("displayNCICodes"));
        textPresent("Female Gender, Self Reported", By.id("nameAsNCI_5"));
        textPresent("A10805030", By.id("codeAsNCI_5"));
    }

}
