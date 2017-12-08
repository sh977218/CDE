package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

public class AdminAddRemoveTagsTest extends NlmCdeBaseTest {

    @Test
    public void adminAddRemoveTags() {
        try {
            String cdeName = "Distance from Closest Margin Value";

            mustBeLoggedInAs(nlm_username, nlm_password);
            clickElement(By.id("username_link"));
            clickElement(By.linkText("Org Management"));
            clickElement(By.linkText("List Management"));
            clickElement(By.xpath("//tr[@id='orgListName-TEST']//td[3]//input"));
            clickElement(By.xpath("//li[. = 'canYouSeeThis']"));
            textPresent("Org Updated");
            closeAlert();

            // ensure it got saved.
            goHome();
            clickElement(By.id("username_link"));
            clickElement(By.linkText("Org Management"));
            clickElement(By.linkText("List Management"));
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

            goHome();

            goToCdeByName("Distance from Closest Margin Value");
            goToNaming();
            clickElement(By.id("openNewNamingModalBtn"));
            clickElement(By.xpath("//*[@id='newTags']//input"));
            textNotPresent("canYouSeeThis");
        } catch (Exception e) {
            System.out.println(get(baseUrl + "/listOrgsDetailedInfo").asString());
            throw e;
        }
    }

}
