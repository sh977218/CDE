package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeReorderDetailTabsTest extends NlmCdeBaseTest {
    @Test
    public void CdeReorderDetailTabs() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "cde for test cde reorder detail tabs";
        createCde(cdeName);
        goToCdeByName(cdeName);
        testPermissible();
        findElement(By.linkText("Naming")).click();
        findElement(By.linkText("Concepts")).click();
        findElement(By.linkText("Reference Documents")).click();
        findElement(By.linkText("Properties")).click();
    }

    private void testPermissible() {
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Values Allowed");
        findElement(By.id("editDatatype")).click();
        textPresent("None Selected");
        findElement(By.id("valueTypeSelect")).click();
        textPresent("Value List");
        findElement(By.cssSelector("#valueTypeSelect > option:nth-child(2)")).click();
        textPresent("No Permissible Values");
        for (int i = 0; i < 4; i++)
            addPermissible(i);
        findElement(By.id("openSave")).click();
        textPresent("Change Note");
        findElement(By.id("confirmNewVersion")).click();
        closeAlert();
        Assert.assertEquals(driver.findElements(By.id("moveUp-0")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveTop-0")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveUp-1")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveTop-1")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveUp-2")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveTop-2")).size(), 1);
        Assert.assertEquals(driver.findElements(By.id("moveDown-3")).size(), 0);
        Assert.assertEquals(driver.findElements(By.id("moveBottom-3")).size(), 0);
        findElement(By.id("moveDown-0")).click();
        textPresent("");
    }

    private void addPermissible(int i) {
        findElement(By.id("addPv")).click();
        textPresent("Code System");
        findElement(By.xpath("//td[@id='pv-" + i + "']/div/span/span/i")).click();
        textPresent("Confirm");
        findElement(By.xpath("//td[@id='pv-" + i + "']/div/span/form/input")).sendKeys("pv" + i);
        findElement(By.xpath("//td[@id='pv-" + i + "']/div/span/form/button")).click();
        textPresent("pv" + i);
    }

}
