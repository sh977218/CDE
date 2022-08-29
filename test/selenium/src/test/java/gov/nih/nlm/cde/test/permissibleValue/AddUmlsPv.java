package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class AddUmlsPv extends NlmCdeBaseTest {

    @Test
    public void addUmlsPv() {
        String cdeName = "Scale for Outcomes in PD Autonomic (SCOPA-AUT) - urinate night indicator";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToCdeByName(cdeName);
        goToPermissibleValues();
        clickElement(By.id("openAddPermissibleValueModelBtn"));
        clickElement(By.id("valueMeaningNameInput"));
        findElement(By.id("valueMeaningNameInput")).sendKeys("Female");
        textPresent("Choices from UMLS");
        textPresent("C0086287 : Females");
        clickElement(By.linkText("C0086287 : Females"));
        clickElement(By.id("createNewPermissibleValueBtn"));
        textPresent("C0086287", By.id("pvMeaningCode_5"));

        clickElement(By.id("displayNCICodes"));
        textNotPresent("Retrieving...");
        textPresent("Female", By.id("nameAsNCI_5"));
        textPresent("A7570536", By.id("codeAsNCI_5"));

        clickElement(By.id("displayLNCCodes"));
        textNotPresent("Retrieving...");
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("A24095561", By.id("codeAsLNC_5"));

        clickElement(By.id("displaySNOMEDCT_USCodes"));
        textNotPresent("Retrieving...");
        textPresent("Female", By.id("nameAsSCT_5"));
        textPresent("A2881557", By.id("codeAsSCT_5"));

        newCdeVersion();
        textPresent("Female", By.id("nameAsNCI_5"));
        textPresent("A7570536", By.id("codeAsNCI_5"));
        textPresent("Female", By.id("nameAsLNC_5"));
        textPresent("A24095561", By.id("codeAsLNC_5"));
        textPresent("Female", By.id("nameAsSCT_5"));
        textPresent("A2881557", By.id("codeAsSCT_5"));
        textNotPresent("Retrieving...");

        logout();
        goToCdeByName(cdeName);
        goToPermissibleValues();

        Assert.assertFalse(findElement(By.id("displayLNCCodes")).isEnabled());
        Assert.assertFalse(findElement(By.id("displaySNOMEDCT_USCodes")).isEnabled());

        clickElement(By.id("displayNCICodes"));
        textPresent("Female", By.id("nameAsNCI_5"));
        textPresent("A7570536", By.id("codeAsNCI_5"));
        textNotPresent("Retrieving...");
    }

}
