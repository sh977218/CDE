package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.testng.annotations.Test;

public class AdminAddRemoveTagsTest extends NlmCdeBaseTest {

    @Test
    public void adminAddRemoveTags() {
        String cdeName = "Distance from Closest Margin Value";

        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//input")).sendKeys("canYouSeeThis");
        findElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//input")).sendKeys(Keys.RETURN);
        textPresent("Org Updated");
        closeAlert();

        goHome();

        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));
        clickElement(By.id("openNewNamingModalBtn"));
        textPresent("Tags are managed in Org Management > List Management");
        clickElement(By.xpath("//*[@id='newTags']//input"));
        String selectTagXpath = "//span[contains(@class,'select2-results')]/ul//li[text()='canYouSeeThis']";
        clickElement(By.xpath(selectTagXpath));
        clickElement(By.id("cancelNewNamingBtn"));

        clickElement(By.id("username_link"));
        clickElement(By.linkText("Org Management"));
        clickElement(By.linkText("List Management"));

        new Actions(driver).moveToElement(findElement(By.id("orgListName-Training")));
        clickElement(By.xpath("//li[contains(., 'canYouSeeThis')]/span"));
        textPresent("Org Updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.id("naming_tab"));
        clickElement(By.id("openNewNamingModalBtn"));
        clickElement(By.xpath("//*[@id='newTags']//input"));
        textNotPresent("canYouSeeThis");
    }

}
