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
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName("Study Drug Compliance");
        clickElement(By.id("naming_tab"));
        clickElement(By.id("addNamePair"));
        textPresent("Tags are managed in Org Management > List Management");
        findElement(By.name("designation")).sendKeys("This new form Name");
        findElement(By.name("definition")).sendKeys("A lazy definition");
        clickElement(By.xpath("//*[@id='newTags']//input"));
        clickElement(By.xpath("//*[contains(@class,'ui-select-choices-row ')]/span[normalize-space(text())='Great CTX']"));
        clickElement(By.id("createNamePair"));
        modalGone();
        saveForm();

        goToFormByName("Study Drug Compliance");
        clickElement(By.id("naming_tab"));
        textPresent("This new form Name");
        textPresent("A lazy definition");
        textPresent("Great CTX");

        clickElement(By.id("removeNaming-1"));
        saveForm();

        goToFormByName("Study Drug Compliance");
        clickElement(By.id("naming_tab"));
        textNotPresent("\"A lazy definition\"");

        mustBeLoggedOut();
        goToFormByName("Study Drug Compliance");
        clickElement(By.id("naming_tab"));
        for (WebElement elt : driver.findElements(By.cssSelector(".fa-trash-o"))) {
            Assert.assertFalse(elt.isDisplayed());
        }
    }

}
