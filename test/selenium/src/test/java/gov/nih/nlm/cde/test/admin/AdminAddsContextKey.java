package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddsContextKey extends NlmCdeBaseTest {

    @Test
    public void addRemoveContext() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.id("#add_org_context_TEST"));
        findElement(By.id("newValue")).sendKeys("canYouSeeThis");
        clickElement(By.id("okValue"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        textPresent("Contexts are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newTags']//input"));
        try {
            findElement(By.xpath("//*[contains(@class,'ui-select-choices-row ')]/a[normalize-space(text())='canYouSeeThis']"));
        } catch (TimeoutException e) {
            Assert.fail("Failed to find canYouSeeThis. Actual HTML: " + findElement(By.id("newContext")).getAttribute("outerHTML"));
        }

        clickElement(By.id("cancelCreate"));
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        new Actions(driver).moveToElement(findElement(By.id("orgListName-Training")));
        clickElement(By.xpath("//span/span[contains(.,'canYouSeeThis')]/i"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.linkText("Naming"));
        clickElement(By.id("addNamePair"));
        clickElement(By.xpath("//*[@id='newTags']//input"));
        textNotPresent("canYouSeeThis");
    }

}
