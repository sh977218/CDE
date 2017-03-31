package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormNamingTest extends BaseFormTest {

    public void goToEltByName(String name) {
        goToFormByName(name);
    }

    public void goToEltSearch() {
        goToFormSearch();
    }

    @Test
    public void formNaming() {
        String formName = "Study Drug Compliance";
        String newName = "This new form Name";
        String newDefinition = "A lazy definition";
        String newTag = "Great CTX";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);

        clickElement(By.id("naming_tab"));
        addNewName(newName, newDefinition, new String[]{newTag});
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("naming_tab"));
        textPresent(newName);
        textPresent(newDefinition);
        textPresent(newTag);

        clickElement(By.id("removeNaming-1"));
        saveForm();

        goToFormByName(formName);
        clickElement(By.id("naming_tab"));
        textNotPresent(newDefinition);

        mustBeLoggedOut();
        goToFormByName(formName);
        clickElement(By.id("naming_tab"));
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
