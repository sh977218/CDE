package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
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
        clickElement(By.id("add_org_context_TEST"));
        findElement(By.id("newValue")).sendKeys("canYouSeeThis");
        clickElement(By.id("okValue"));
        textPresent("Org has been updated");
        closeAlert();

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
        clickElement(By.xpath("//span/span[contains(.,'canYouSeeThis')]/i"));
        textPresent("Org has been updated");
        closeAlert();

        goToCdeByName("Distance from Closest Margin Value");
        clickElement(By.id("naming_tab"));
        clickElement(By.id("openNewNamingModalBtn"));
        clickElement(By.xpath("//*[@id='newTags']//input"));
        textNotPresent("canYouSeeThis");
    }

}
