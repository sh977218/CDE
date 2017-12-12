package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OrgAdminTasks extends BaseClassificationTest {
    
    @Test
    public void orgAdminTasks() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Account Management")).click();
        hangon(1);
        findElement(By.linkText("Organizations Curators")).click();       
        new Select(findElement(By.name("newOrgCuratorOrgName"))).selectByVisibleText("caBIG");
        findElement(By.name("newOrgCuratorUsername")).sendKeys("userToPromote");
        clickElement(By.xpath("//ngb-highlight//span[. = 'userToPromote']"));
        findElement(By.id("newOrgCuratorSubmit")).click();
        checkAlert("Saved");
        textPresent("userToPromote");
        int orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgCuratorOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgCuratorOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgCuratorUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(
                            By.xpath("//span[@id='existingOrgCuratorUsername-" + i + "-" + j + "']")).getText())) {
                        findElement(By.xpath("//i[@id='removeOrgCuratorUsername-" + i + "-" + j + "']")).click();
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        checkAlert("Removed");
        textNotPresent("userToPromote");

        findElement(By.linkText("Organizations Admins")).click();
        new Select(findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText("caBIG");
        findElement(By.id("newOrgAdminUsername")).sendKeys("userToPromote");
        findElement(By.id("newOrgAdminSubmit")).click();
        checkAlert("Saved");
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
        textPresent("Removed");
        textNotPresent("userToPromote");
    }
    
}
