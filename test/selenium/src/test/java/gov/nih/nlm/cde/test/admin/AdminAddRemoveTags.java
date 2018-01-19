package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminAddRemoveTags extends NlmCdeBaseTest {

    @Test
    public void adminAddRemoveTags() {
        String cdeName = "Distance from Closest Margin Value";

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//input"));
        clickElement(By.xpath("//li[. = 'canYouSeeThis']"));
        checkAlert("Org Updated");
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//li[contains(., 'canYouSeeThis')]/span"));

        goToCdeByName(cdeName);
        goToNaming();
        clickElement(By.id("openNewNamingModalBtn"));
        textPresent("Tags are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newTags']//input"));
        clickElement(By.xpath("//span[contains(@class,'select2-results')]/ul//li[text()='canYouSeeThis']"));
        clickElement(By.id("cancelNewNamingBtn"));

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        new Actions(driver).moveToElement(findElement(By.id("orgListName-Training")));
        clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//li[contains(., 'canYouSeeThis')]/span"));
        textPresent("Org Updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        goToNaming();
        clickElement(By.id("openNewNamingModalBtn"));
        clickElement(By.xpath("//*[@id='newTags']//input"));
        textNotPresent("canYouSeeThis");

    }

    @Test
    public void adminAddRemovePropertyKey() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[2]//input"));
        clickElement(By.xpath("//li[. = 'doYouSeeThis']"));
        checkAlert("Org Updated");
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[2]//li[contains(.,'doYouSeeThis')]/span"));

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
        clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[2]//li[contains(.,'doYouSeeThis')]/span"));
        checkAlert("Org Updated");

        goToCdeByName("Distance from Closest Margin Value");

        goToProperties();
        clickElement(By.id("openNewPropertyModalBtn"));
        clickElement(By.id("newKey"));

        clickElement(By.xpath("//option[@value='propKey0']"));
        Assert.assertEquals(driver.findElements(By.xpath("//option[@value='doYouSeeThis']")).size(), 0);
    }

}
