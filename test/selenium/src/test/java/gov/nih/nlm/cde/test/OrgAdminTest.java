package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdminTest extends NlmCdeBaseTest {

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
        new Select(findElement(By.name("curator.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgCurator.username")).sendKeys("user1");
        findElement(By.id("addOrgCurator")).click();
        Assert.assertTrue(textPresent("Organization Curator Added"));
        Assert.assertTrue(textPresent("user1"));
        findElement(By.xpath("//div[2]/div/div[2]/div/div[2]/i")).click();
        textPresent("Organization Curator Removed");
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("user1"));

        findElement(By.linkText("Organizations Admins")).click();       
        new Select(findElement(By.name("admin.orgName"))).selectByVisibleText("caBIG");
        findElement(By.name("orgAdmin.username")).sendKeys("user1");
        findElement(By.id("addOrgAdmin")).click();
        textPresent("Organization Administrator Added");
        textPresent("user1");

        int orgLength = driver.findElements(By.xpath("//div[starts-with(@id, 'orgAdmin-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//div[@id='orgAdmin-" + i + "']")).getText())) {
                int userLength = driver.findElements(By.xpath("//div[starts-with(@id, 'orgAdminUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("user1".equals(findElement(By.xpath("//div[@id='orgAdminUsername-" + i + "-" + j + "']")).getText())) {
                        findElement(By.xpath("//i[@id='orgAdminTrash-" + i + "-" + j + "']")).click();
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        textPresent("Organization Administrator Removed");
        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("user1"));
    }
    
    @Test
    public void adminProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Profile")).click();
        Assert.assertEquals("cabigAdmin", findElement(By.id("username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("quota")).getText());
        Assert.assertEquals("[]", findElement(By.id("curatorFor")).getText());
        Assert.assertEquals("[\"caBIG\"]", findElement(By.id("adminFor")).getText());
    }
    
    @Test
    public void cdesTransferSteward() {
        mustBeLoggedInAs(transferStewardUser_username, password);
        
        // create 2 cdes
        String cde1 = "Transfer Steward Test CDE 1";
        String definition1 = "Definition for Transfer Steward Test CDE 1";
        String version1 = "1.0";
        String org1 = "PS&CC";
        String class1 = "caSEER";
        String subclass1 = "com.imsweb.caseer";
        fillOutBasicCreateFields(cde1, definition1, version1, org1, class1, subclass1);
        Assert.assertTrue(textPresent(class1));
        Assert.assertTrue(textPresent(subclass1));
        findElement(By.id("submit")).click();
        modalGone();
        
        String cde2 = "Transfer Steward Test CDE 2";
        String definition2 = "Definition for Transfer Steward Test CDE 2";
        String version2 = "2.0";
        String class2 = class1;
        String subclass2 = subclass1;
        fillOutBasicCreateFields(cde2, definition2, version2, org1, class2, subclass2);
        Assert.assertTrue(textPresent(class2));
        Assert.assertTrue(textPresent(subclass2));
        findElement(By.id("submit")).click();
        modalGone();
        
        // create 2 forms
        String formName1 = "Transfer Steward Test Form 1";
        String formDef1 = "Definition for Transfer Steward Test CDE 1";
        String formV1 = "3.0";
        createForm(formName1, formDef1, formV1, org1);
        Assert.assertTrue(textPresent(formName1));
        Assert.assertTrue(textPresent(formDef1));
        
        String formName2 = "Transfer Steward Test Form 2";
        String formDef2 = "Definition for Transfer Steward Test CDE 2";
        String formV2 = "4.0";
        createForm(formName2, formDef2, formV2, org1);
        Assert.assertTrue(textPresent(formName2));
        Assert.assertTrue(textPresent(formDef2));       
        
        // 
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        findElement(By.linkText("CDE & Form Management")).click();
        
        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        findElement(By.id("transferStewardButton")).click();
        textPresent("8 CDEs transferred.");
        textPresent("2 forms transferred.");
        
        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText(org1);
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText("LCC");
        findElement(By.id("transferStewardButton")).click();
        textPresent("There are no CDEs to transfer.");
        textPresent("There are no forms to transfer.");
        
        new Select(findElement(By.name("transferSteward_from"))).selectByVisibleText("LCC");
        new Select(findElement(By.name("transferSteward_to"))).selectByVisibleText(org1);
        findElement(By.id("transferStewardButton")).click();
        textPresent("8 CDEs transferred.");
        textPresent("2 forms transferred.");
    }
    
}
