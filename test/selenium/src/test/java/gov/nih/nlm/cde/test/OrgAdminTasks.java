package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class OrgAdminTasks extends BaseClassificationTest {

    @Test
    public void orgAdminTasks() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Account Management"));
        hangon(1);
        clickElement(By.xpath("//div[. = 'Organizations Curators']"));
        new Select(findElement(By.name("newOrgCuratorOrgName"))).selectByVisibleText("caBIG");
        searchUsername("userToPromote");
        clickElement(By.id("newOrgCuratorSubmit"));
        checkAlert("Saved");
        textPresent("userToPromote");
        int orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgCuratorOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgCuratorOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgCuratorUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(
                            By.xpath("//span[@id='existingOrgCuratorUsername-" + i + "-" + j + "']")).getText())) {
                        clickElement(By.xpath("//mat-icon[@id='removeOrgCuratorUsername-" + i + "-" + j + "']"));
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        checkAlert("Removed");
        textNotPresent("userToPromote");

        clickElement(By.xpath("//div[. = 'Organizations Admins']"));
        new Select(findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText("caBIG");
        findElement(By.name("searchUsersInput")).sendKeys("userToPromote");
        clickElement(By.id("newOrgAdminSubmit"));
        checkAlert("Saved");
        textPresent("userToPromote");
        orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgAdminOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgAdminOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgAdminUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(By.xpath("//span[@id='existingOrgAdminUsername-" + i + "-" + j + "']")).getText())) {
                        clickElement(By.xpath("//mat-icon[@id='removeOrgAdminUsername-" + i + "-" + j + "']"));
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
