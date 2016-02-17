package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateForm extends BaseFormTest {

    @Test
    public void createForm() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Create Form Test Name";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";
        String formOrg = "TEST";

        goHome();
        clickElement(By.id("createEltLink"));
        clickElement(By.id("createFormLink"));
        textPresent("Please enter a name for the new form.");

        findElement(By.id("formName")).sendKeys(formName);
        findElement(By.id("formDefinition")).sendKeys(formDef);
        fillInput("Version", formV);

        new Select(findElement(By.id("newForm.stewardOrg.name"))).selectByVisibleText(formOrg);
        clickElement(By.id("createForm"));
        textPresent("Form created");
        closeAlert();

        Assert.assertTrue(textPresent(formName));
        Assert.assertTrue(textPresent(formDef));
        Assert.assertTrue(textPresent(formV));

        goToFormByName(formName);
        textPresent(formDef);
    }

}
