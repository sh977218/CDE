package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;

public abstract class NamingTest extends CommonTest {

    public void addRemoveEditTest() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        String cdeName = "Principal Investigator State java.lang.String";
        goToCdeByName(cdeName);
        clickElement(By.linkText("Naming"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("removeNaming-0")));
        clickElement(By.id("addNamePair"));
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createNamePair"))));
        findElement(By.name("designation")).sendKeys("New Name");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("createNamePair")));
        findElement(By.name("definition")).sendKeys("New Definition");
        clickElement(By.id("createNamePair"));
        modalGone();

        newCdeVersion();

        clickElement(By.linkText("Naming"));
        textPresent("New Name");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("removeNaming-1")));
        clickElement(By.cssSelector("#dd_name_1 .fa-edit"));
        findElement(By.cssSelector("#dd_name_1 input")).sendKeys(" Changed");
        clickElement(By.cssSelector("#dd_name_1 .fa-check"));

        newCdeVersion();

        clickElement(By.linkText("Naming"));
        textPresent("New Name Changed");

        clickElement(By.cssSelector("#dd_def_1 .fa-edit"));
        findElement(By.cssSelector("#dd_def_1 textarea ")).sendKeys(" Changed");
        clickElement(By.cssSelector("#dd_def_1 .fa-check"));

        newCdeVersion();

        clickElement(By.linkText("Naming"));
        textPresent("New Definition Changed");

        clickElement(By.cssSelector("#dd_context_1 .fa-edit"));
        new Select(findElement(By.cssSelector("#dd_context_1 select"))).selectByVisibleText("Health Changed");
        clickElement(By.cssSelector("#dd_context_1 .fa-check"));
        textPresent("Health Changed");

        newCdeVersion();

        clickElement(By.linkText("Naming"));
        textPresent("Health Changed");

        clickElement(By.id("removeNaming-1"));

        newCdeVersion();

        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("New Name"));
    }

    public void reorderNamingTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        clickElement(By.linkText("Naming"));
        textPresent("Definition:");
        reorderIconTest(tabName);
        clickElement(By.xpath(prefix + "moveDown-0" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
        clickElement(By.xpath(prefix + "moveUp-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs 2"));
        clickElement(By.xpath(prefix + "moveTop-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
    }


}
