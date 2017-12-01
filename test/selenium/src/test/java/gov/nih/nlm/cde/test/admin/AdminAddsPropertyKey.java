package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
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
        clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//input"));
        clickElement(By.xpath("//li[. = 'doYouSeeThis']"));
        textPresent("Org Updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));
        findElement(By.xpath("//option[@value='doYouSeeThis']"));
        findElement(By.xpath("//option[@value='propKey0']"));

        clickElement(By.id("cancelNewPropertyBtn"));

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        new Actions(driver).moveToElement(findElement(By.id("orgListName-Training"))).perform();
        clickElement(By.xpath("//li[contains(.,'doYouSeeThis')]/span"));
        textPresent("Org Updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));

        findElement(By.xpath("//option[@value='propKey0']"));
        Assert.assertEquals(driver.findElements(By.xpath("//option[@value='doYouSeeThis']")).size(), 0);
    }

}
