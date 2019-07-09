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


        clickElement(By.xpath("//td[span[. = 'promoteSiteAdmin']]/mat-icon"));
        checkAlert("Removed");
        textNotPresent("promoteSiteAdmin");
    }

    @Test
    public void removeWrongUser() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        // this board is owned by boardUser
        given().cookie(myCookie).body("{username: 'bad_username'}")
                .post(baseUrl + "/server/siteAdmin/removeSiteAdmin").then().statusCode(404);

        given().cookie(myCookie).post(baseUrl + "/server/siteAdmin/removeSiteAdmin").then().statusCode(422);

    }

}
