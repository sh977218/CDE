package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdminTest extends NlmCdeBaseTest {

    @Test
    public void orgAdminCanEditHisCdes() {
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        goToCdeByName("Cervical Tumor Clinical T Stage");
        Assert.assertTrue(textPresent("as defined by the AJCC Cancer Staging Manual, 6th Ed."));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("i.fa-edit")));
        goToCdeByName("Communication Contact Email Address java.lang.String");
        Assert.assertTrue(textPresent("A modern Internet e-mail address (using SMTP)"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-edit")));
    }
    
    @Test
    public void orgAdminTasks() {
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.linkText("Organizations Curators")).click();       
        new Select(findElement(By.name("curator.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgCurator.username")).sendKeys("user1");
        findElement(By.id("addOrgCurator")).click();
        Assert.assertTrue(textPresent("Organization Curator Added"));
        Assert.assertTrue(textPresent("user1"));
        findElement(By.xpath("//div[2]/div/div[2]/div/div[2]/i")).click();
        Assert.assertTrue(textPresent("Organization Curator Removed"));
        Assert.assertTrue(findElement(By.cssSelector("BODY")).getText().indexOf("user1") < 0);

        findElement(By.linkText("Organizations Admins")).click();       
        new Select(findElement(By.name("admin.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgAdmin.username")).sendKeys("user1");
        findElement(By.id("addOrgAdmin")).click();
        Assert.assertTrue(textPresent("Organization Administrator Added"));
        Assert.assertTrue(textPresent("user1"));

        int orgLength = driver.findElements(By.xpath("//div[starts-with(@id, 'orgAdmin-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//div[@id='orgAdmin-" + i + "']")).getText())) {
                int userLength = driver.findElements(By.xpath("//div[starts-with(@id, 'orgAdminUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("user1".equals(findElement(By.xpath("//div[@id='orgAdminUsername-" + i + "-" + j + "']")).getText())) {
                        findElement(By.xpath("//i[@id='orgAdminTrash-" + i + "-" + j + "']")).click();
                    }
                }
            }
        }

        
//        findElement(By.xpath("//div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Organization Administrator Removed"));
        Assert.assertTrue(findElement(By.cssSelector("BODY")).getText().indexOf("user1") < 0);
    }
    
    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigAdmin_username, cabigAdmin_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("cabigAdmin", findElement(By.id("dd_username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("dd_quota")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_curatorFor")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("dd_adminFor")).getText());
    }
    

    
}
