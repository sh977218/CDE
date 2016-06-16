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
        findElement(By.linkText("Naming")).click();
        findElement(By.id("addNamePair")).click();
        findElement(By.name("designation")).sendKeys("This new form Name");
        findElement(By.name("definition")).sendKeys("A lazy definition");
        new Select(findElement(By.name("context"))).selectByVisibleText("Great CTX");
        findElement(By.id("createNamePair")).click();
        modalGone();
        saveForm();

        goToFormByName("Study Drug Compliance");
        findElement(By.linkText("Naming")).click();
        textPresent("This new form Name");
        textPresent("A lazy definition");
        textPresent("Great CTX");

        findElement(By.id("removeNaming-1")).click();
        saveForm();

        goToFormByName("Study Drug Compliance");
        findElement(By.linkText("Naming")).click();
        textNotPresent("\"A lazy definition\"");

        mustBeLoggedOut();
        goToFormByName("Study Drug Compliance");
        findElement(By.linkText("Naming")).click();
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
