package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

public class CreateForm extends BaseClassificationTest {

    @Test
    @Parameters("Create Form Test Name")
    public void createForm(String formName, boolean checkEs) {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";
        String formOrg = "TEST";

        clickElement(By.id("createEltLink"));
        clickElement(By.id("createFormLink"));
        textPresent("Please enter a name for the new Form");

        findElement(By.id("eltName")).sendKeys(formName);
        findElement(By.id("eltDefinition")).sendKeys(formDef);
        fillInput("Version", formV);

        textPresent("Please select a steward for the new Form");
        new Select(findElement(By.id("eltStewardOrgName"))).selectByVisibleText(formOrg);
        addClassificationMethod(new String[]{"TEST", "Classify Board", "Classif_Board_Sub"});
        modalGone();
        clickElement(By.id("submit"));
        goToGeneralDetail();
        textPresent(formName);
        textPresent(formDef);

        if (checkEs) {
            waitForESUpdate();
            goToFormByName(formName);
            goToGeneralDetail();
            textPresent(formDef);
        }
    }

}
