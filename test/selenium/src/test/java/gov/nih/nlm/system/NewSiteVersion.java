package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;
import static com.jayway.restassured.RestAssured.post;


public class NewSiteVersion extends NlmCdeBaseTest {

    @Test
    public void newSiteVersion() {
        goToSearch("cde");
        goHome();
        ExpectedConditions.not(ExpectedConditions.visibilityOfElementLocated
                (By.id("notifications")));

        post(baseUrl + "/site-version");
        // wait 20 seconds for pull to work
        hangon(20);
        clickElement(By.id("notifications"));
        textPresent("A new version of this site is available");
    }

}
