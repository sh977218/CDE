package gov.nih.nlm.cde.test.regstatus;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class CdeStandardStatusTest extends NlmCdeBaseTest {

    protected void adminCantEditStandardCde(String cdeName) {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeByName(cdeName);
        // CDE is Standard.
        // Can't edit name, def or status
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_general_name']//i[@class='fa fa-edit']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_def']//i[@class='fa fa-edit']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//dd[@id='dd_status']//i[@class='fa fa-edit']")).size(), 0);

        // Can't edit Value Type or add / remove pv
        String prefix = "//div[@id='permissibleValueDiv']//div//*[@id='";
        String postfix = "']";
        clickElement(By.id("pvs_tab"));
        Assert.assertFalse(driver.findElements(By.xpath("//i[@id='editDatatype']")).get(0).isDisplayed());
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-0" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-1" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-2" + postfix)).size(), 0);
        Assert.assertFalse(driver.findElements(By.xpath("//td[@id='pv-1']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("addPv")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.id("updateOID")).get(0).isDisplayed());

        // Can't edit naming
        clickElement(By.id("naming_tab"));
        Assert.assertFalse(driver.findElements(By.xpath("//div[@id='dd_name_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.xpath("//div[@id='dd_def_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());
        Assert.assertFalse(driver.findElements(By.xpath("//div[@id='dd_context_0']//i[contains(@class, 'fa-edit')]")).get(0).isDisplayed());

        // Can edit classifications
        clickElement(By.id("classification_tab"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("addClassification")));

        // Can't edit Concepts
        showAllTabs();
        clickElement(By.id("concepts_tab"));
        Assert.assertEquals(driver.findElements(By.id("removeobjectClass-0")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("removeproperty-0")).size(), 0);

        // Can't add Attachments
        clickElement(By.id("attachments_tab"));
        Assert.assertEquals(driver.findElements(By.cssSelector("i.fa-upload")).size(), 0);
    }


}
