package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import gov.nih.nlm.system.RecordVideo;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddsPropertyKey extends NlmCdeBaseTest {

    @Test
    @RecordVideo
    public void addRemoveProp() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("add_org_props_TEST"));
        findElement(By.id("newValue")).sendKeys("doYouSeeThis");
        clickElement(By.id("okValue"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        driver.navigate().refresh();
        showAllTabs();
        clickElement(By.linkText("Properties"));
        clickElement(By.id("addProperty"));
        clickElement(By.id("newPropertyKey"));

        try {
            textPresent("doYouSeeThis");
        } catch (TimeoutException e) {
            System.out.println(driver.getPageSource());
            Assert.fail();
        }
        clickElement(By.id("cancelCreate"));

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.xpath("//span/span[contains(.,'doYouSeeThis')]/i"));
        textPresent("Org has been updated");

        goToCdeByName("Distance from Closest Margin Value");
        showAllTabs();
        clickElement(By.linkText("Properties"));
        clickElement(By.id("addProperty"));
        clickElement(By.id("newPropertyKey"));
        textNotPresent("doYouSeeThis");


    }

}
