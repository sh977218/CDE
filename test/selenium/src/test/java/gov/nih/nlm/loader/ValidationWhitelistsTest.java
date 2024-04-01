package gov.nih.nlm.loader;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class ValidationWhitelistsTest extends NlmCdeBaseTest {
    @Test
    public void whitelistAPI1() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();
        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/addNewWhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No name for new whitelist provided"));


    }

    @Test
    public void whitelistAPI2() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();

        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("No whitelist specified"));
    }

    @Test
    public void whitelistAPI3() {
        mustBeLoggedInAs(theOrgAuth_username, password);
        Cookie currentCookie = getCurrentCookie();

        Response resp = given().cookie(currentCookie)
                .contentType(ContentType.JSON)
                .body("{\"collectionName\" : \"this_whitelist_is_not_real\"}")
                .post(baseUrl + "/server/loader/updatewhitelist");
        Assert.assertEquals(resp.getStatusCode(), 400);
        Assert.assertTrue(resp.getBody().print().contains("Whitelist not valid"));
    }
}