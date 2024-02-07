package gov.nih.nlm.cde.test;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class OrgAdminTasks extends BaseClassificationTest {

    @Test
    public void updateOrgError() {
        mustBeLoggedInAs(orgAuthorityUser_username, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{'_id': 'badID'}")
                .post(baseUrl + "/server/orgManagement/updateOrg").then().statusCode(400);

        given().cookie(myCookie).contentType(ContentType.JSON).body("{\"name\": \"NINDS\"}")
                .post(baseUrl + "/server/orgManagement/addOrg").then().statusCode(409);
    }

    @Test
    public void transferStewardError() {
        mustBeLoggedInAs("ctepAdmin", password);
        Cookie myCookie = getCurrentCookie();

        given().cookie(myCookie).contentType(ContentType.JSON).body("{\"from\": \"NINDS\", \"to\": \"ACRIN\"}")
                .post(baseUrl + "/server/orgManagement/transferSteward").then().statusCode(403);
    }


}
