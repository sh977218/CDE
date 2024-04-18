package gov.nih.nlm.cde.test.admin;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class RemoveSiteAdmin extends NlmCdeBaseTest {

    @Test
    public void removeSiteAdmin () {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToSiteAdmins();
        clickElement(By.xpath("//div[span[@class='admin'][. = 'promoteSiteAdmin']]/mat-icon"));
        checkAlert("Removed");
        textNotPresent("promoteSiteAdmin");
    }

}
