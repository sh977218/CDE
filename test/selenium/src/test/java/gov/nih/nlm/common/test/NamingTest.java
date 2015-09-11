package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public abstract class NamingTest extends CommonTest {

    public void addRemoveEditTest() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        String cdeName = "Principal Investigator State java.lang.String";
        goToCdeByName(cdeName);
        findElement(By.linkText("Naming")).click();
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.id("addNamePair")).click();
        findElement(By.name("designation")).sendKeys("New Name");
        findElement(By.name("definition")).sendKeys("New Definition");
        findElement(By.id("createNamePair")).click();
        modalGone();

        newCdeVersion();

        findElement(By.linkText("Naming")).click();
        Assert.assertTrue(textPresent("New Name"));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeNaming-0")));
        findElement(By.cssSelector("#dd_name_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_name_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_name_1 .fa-check")).click();

        newCdeVersion();

        findElement(By.linkText("Naming")).click();
        textPresent("New Name Changed");

        findElement(By.cssSelector("#dd_def_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_def_1 textarea ")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_def_1 .fa-check")).click();

        newCdeVersion();

        findElement(By.linkText("Naming")).click();
        textPresent("New Definition Changed");

        findElement(By.cssSelector("#dd_context_1 .fa-edit")).click();
        findElement(By.cssSelector("#dd_context_1 input")).sendKeys(" Changed");
        findElement(By.cssSelector("#dd_context_1 .fa-check")).click();

        newCdeVersion();

        findElement(By.linkText("Naming")).click();
        textPresent("Health Changed");

        findElement(By.id("removeNaming-1")).click();

        newCdeVersion();

        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("New Name") < 0);

    }

    public void reorderNamingTest(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Naming")).click();
        textPresent("Definition:");
        reorderIconTest(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_2" + postfix)).getText().contains("cde for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("cde for test cde reorder detail tabs 2"));
    }



}
