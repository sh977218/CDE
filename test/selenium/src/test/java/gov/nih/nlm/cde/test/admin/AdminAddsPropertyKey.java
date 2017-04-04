package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddsPropertyKey extends NlmCdeBaseTest {

    @Test
    public void adminAddRemovePropertyKey() {
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

        clickElement(By.id("properties_tab"));
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));

        try {
            findElement(By.xpath("//option[@value='doYouSeeThis']"));
        } catch (TimeoutException e) {
            Assert.fail("Failed to find doYouSeeThis. Actual HTML: " + findElement(By.id("newContext")).getAttribute("outerHTML"));
        }

        clickElement(By.id("cancelCreate"));

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        new Actions(driver).moveToElement(findElement(By.id("orgListName-Training")));
        clickElement(By.xpath("//span/span[contains(.,'doYouSeeThis')]/i"));
        textPresent("Org has been updated");

        goToCdeByName("Distance from Closest Margin Value");

        clickElement(By.id("properties_tab"));
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));
        textNotPresent("doYouSeeThis");
    }

}
