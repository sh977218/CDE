package gov.nih.nlm.cde.test;


import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class OrgAdminTest extends NlmCdeBaseTest {
    
    @BeforeClass
    public void login() {
        loginAs(cabigAdmin_username, cabigAdmin_password);
    }

    @AfterClass
    public void logMeOut() {
        logout();
    }

    
    
    @Test
    public void orgAdminCanEditHisCdes() {
        goToCdeByName("Cervical Tumor Clinical T Stage");
        Assert.assertTrue(textPresent("as defined by the AJCC Cancer Staging Manual, 6th Ed."));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("i.fa-edit")));
        goToCdeByName("Communication Contact Email Address java.lang.String");
        Assert.assertTrue(textPresent("A modern Internet e-mail address (using SMTP)"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("i.fa-edit")));
    }
    
    @Test
    public void orgAdminTasks() {
        findElement(By.linkText("Account")).click();
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
        findElement(By.xpath("//div[2]/div[2]/i")).click();
        Assert.assertTrue(textPresent("Organization Administrator Removed"));
        Assert.assertTrue(findElement(By.cssSelector("BODY")).getText().indexOf("user1") < 0);
    }
    
    @Test
    public void adminProfile() {
        findElement(By.linkText("Account")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("cabigAdmin", findElement(By.id("dd_username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("dd_quota")).getText());
        Assert.assertEquals("[]", findElement(By.id("dd_curatorFor")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("dd_adminFor")).getText());
    }
    

    
}
