package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
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
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Study Drug Compliance");
        clickElement(By.id("naming_tab"));
        clickElement(By.id("addNamePair"));
        findElement(By.name("designation")).sendKeys("This new form Name");
        findElement(By.name("definition")).sendKeys("A lazy definition");
        new Select(findElement(By.name("context"))).selectByVisibleText("Great CTX");
        clickElement(By.id("createNamePair"));
        modalGone();
        saveForm();

        goToFormByName("Study Drug Compliance");
        clickElement(By.linkText("Naming"));
        textPresent("This new form Name");
        textPresent("A lazy definition");
        textPresent("Great CTX");

        clickElement(By.id("removeNaming-1"));
        saveForm();

        goToFormByName("Study Drug Compliance");
        clickElement(By.linkText("Naming"));
        textNotPresent("\"A lazy definition\"");

        mustBeLoggedOut();
        goToFormByName("Study Drug Compliance");
        clickElement(By.linkText("Naming"));
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
