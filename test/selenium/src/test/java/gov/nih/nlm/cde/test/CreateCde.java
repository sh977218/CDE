package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

public class CreateCde extends BaseClassificationTest {

    @Test
    @Parameters("Create Cde Test Name")
    public void createCde(String cdeName, boolean checkEs) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String cdeDef = "Fill out carefully!";
        String cdeOrg = "TEST";

        hoverOverElement(findElement(By.id("createEltLink")));
        clickElement(By.id("createCDELink"));
        textPresent("Please enter a name for the new CDE");

        findElement(By.id("eltName")).sendKeys(cdeName);
        findElement(By.id("eltDefinition")).sendKeys(cdeDef);

        textPresent("Please select a steward for the new CDE");
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(cdeOrg);
        addClassificationMethod(new String[]{"TEST", "Classify Board", "Classif_Board_Sub"});
        modalGone();
        clickElement(By.id("submit"));
        goToGeneralDetail();
        textPresent(cdeName);
        textPresent(cdeDef);

        if (checkEs) {
            waitForESUpdate();
            goToCdeByName(cdeName);
            goToGeneralDetail();
            textPresent(cdeDef);
        }
    }

}
