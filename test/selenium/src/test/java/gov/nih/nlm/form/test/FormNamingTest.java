package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class FormNamingTest extends BaseFormTest {

    @Override
    public void goToEltByName(String name, String status) {
        goToFormByName(name, status);
    }

    @Override
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
        findElement(By.name("context")).clear();
        findElement(By.name("context")).sendKeys("Great CTX");
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

    @Test
    public void formReorderNamingTest() {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName("form for test cde reorder detail tabs", null);
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Naming")).click();
        textPresent("Definition:");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("form for test cde reorder detail tabs"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_2" + postfix)).getText().contains("form for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("form for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("form for test cde reorder detail tabs 2"));

    }


}
