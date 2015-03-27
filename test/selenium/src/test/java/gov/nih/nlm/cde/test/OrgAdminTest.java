package gov.nih.nlm.cde.test;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.Dimension;

public class OrgAdminTest extends BaseClassificationTest {

    @Test
    public void orgAdminCanEditHisCdes() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        goToCdeByName("Cervical Tumor Clinical T Stage");
        textPresent("as defined by the AJCC Cancer Staging Manual, 6th Ed.");
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("i.fa-edit")));
        goToCdeByName("Communication Contact Email Address java.lang.String");
        textPresent("A modern Internet e-mail address (using SMTP)");
        shortWait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-edit")));
    }
    
    @Test
    public void orgAdminTasks() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.linkText("Organizations Curators")).click();       
        new Select(findElement(By.name("newOrgCuratorOrgName"))).selectByVisibleText("caBIG");
        findElement(By.name("newOrgCuratorUsername")).sendKeys("userToPromote");
        Assert.assertEquals(findElement(By.xpath("//form[@id='newOrgCuratorForm']/div[1]/ul/li[1]/a")).getText(), "userToPromote");
        findElement(By.xpath("//form[@id='newOrgCuratorForm']/div[1]/ul/li[1]/a")).click();
        findElement(By.id("newOrgCuratorSubmit")).click();
        Assert.assertTrue(textPresent("Organization Curator Added"));
        Assert.assertTrue(textPresent("userToPromote"));
        int orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgCuratorOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgCuratorOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgCuratorUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(By.xpath("//span[@id='existingOrgCuratorUsername-" + i + "-" + j + "']")).getText())) {
                        findElement(By.xpath("//i[@id='removeOrgCuratorUsername-" + i + "-" + j + "']")).click();
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        textPresent("Organization Curator Removed");
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("userToPromote"));

        findElement(By.linkText("Organizations Admins")).click();
        new Select(findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText("caBIG");
        findElement(By.id("newOrgAdminUsername")).sendKeys("userToPromote");
        Assert.assertEquals(findElement(By.xpath("//form[@id='newOrgAdminForm']/div[1]/ul/li[1]/a")).getText(), "userToPromote");
        findElement(By.xpath("//form[@id='newOrgAdminForm']/div[1]/ul/li[1]/a")).click();
        findElement(By.id("newOrgAdminSubmit")).click();
        textPresent("Organization Administrator Added");
        textPresent("userToPromote");
        orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgAdminOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgAdminOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgAdminUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(By.xpath("//span[@id='existingOrgAdminUsername-" + i + "-" + j + "']")).getText())) {
                        findElement(By.xpath("//i[@id='removeOrgAdminUsername-" + i + "-" + j + "']")).click();
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        textPresent("Organization Administrator Removed");
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("userToPromote"));
    }
    
}
