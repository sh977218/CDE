package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class ReclassifyTest extends BaseClassificationTest {

    @Test
    public void reclassifyOrgAdminForMany() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        gotoClassifMgt();
        findElement(By.cssSelector(".fa-retweet")).click();
        new Select(driver.findElement(By.id("selectClassificationOrg"))).selectByVisibleText("caBIG");
        findElement(By.id("closeModal")).click();
    }

}
