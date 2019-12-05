package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.RestAssured;
import io.restassured.http.Cookie;
import io.restassured.http.Header;
import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;
import static io.restassured.RestAssured.given;

public class MiscTests extends NlmCdeBaseTest {

    @Test
    public void gridView() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-AECC"));
        textPresent("NCI Standard Template");
        clickElement(By.id("list_gridView"));
        textPresent("Pathologic N Stage");
        textPresent("If No, specify reason for ");
        textPresent("AE Ongoing?");
        textPresent("Patient DOB");
        textPresent("pN0");
        textPresent("pN1");
        textPresent("Not Hispanic or Latino");
        textPresent("Hispanic or Latino");
        textPresent("American Indian or Alaska Native");
        textPresent("Female");
        textPresent("3436564");
        textPresent("2182832");
        textPresent("2746311");
        textPresent("2192217");
        textPresent("NHLBI");
        textPresent("SPOREs");
        textPresent("NICHD");

        clickElement(By.id("list_summaryView"));
        textNotPresent("Pathologic N Stage");
        textNotPresent("If No, specify reason for ");
        textNotPresent("AE Ongoing?");
        textNotPresent("Patient DOB");
        textNotPresent("2192217");
        textPresent("Not Hispanic or Latino");
        textPresent("Hispanic or Latino");
    }

    @Test
    public void checkTicketValid() {
        String username = "cdevsacprod";
        String password = "Aa!!!000";
        String tgtUrl = "https://vsac.nlm.nih.gov:443/vsac/ws/Ticket";

        // Test to make sure user isn't logged in
        String notLoggedInResponse = get(baseUrl + "/server/system/user/me").asString();
        Assert.assertEquals(notLoggedInResponse, "");

        Header header = new Header("Content-Type", "application/x-www-form-urlencoded");
        Response tpgResponse = RestAssured.given().formParam("username", username).formParam("password", password).header(header).request().post(tgtUrl);
        String tgt = tpgResponse.asString();
        System.out.println("got tgt: " + tgt);

        String ticketUrl = "https://vsac.nlm.nih.gov/vsac/ws/Ticket/" + tgt;
        Response ticketResponse = RestAssured.given().formParam("service", "http://umlsks.nlm.nih.gov").header(header).request().post(ticketUrl);
        String ticket = ticketResponse.asString();
        System.out.println("got ticket: " + ticket);

        String actualResponse = given().queryParam("ticket", ticket).get(baseUrl + "/user/me").asString();
        Assert.assertTrue(actualResponse.contains("_id"), "actualResponse: " + actualResponse);
        Assert.assertTrue(actualResponse.contains(username), "actualResponse: " + actualResponse);
        Assert.assertFalse(actualResponse.contains(password), "actualResponse: " + actualResponse);

    }

    @Test
    public void checkTicketInvalid() {
        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/server/system/user/me").asString();
        Assert.assertEquals(response, "");

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl + "/user/me?ticket=invalid").asString();
        Assert.assertEquals(response, "");
    }

    @Test
    public void checkSchemas() {
        Assert.assertTrue(get(baseUrl + "/schema/cde").asString().contains("{\"title\":\"DataElement\""));

        Assert.assertTrue(get(baseUrl + "/schema/form").asString().contains("{\"title\":\"Form\""));
    }

    @Test
    public void whenArticleWrongKey_then400() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{key:'notWhatsNew'}").post(baseUrl + "/server/article/whatsNew").then().statusCode(400);
    }

    @Test
    public void siteStatus() {
        String response = get(baseUrl + "/status/cde").asString();
        Assert.assertTrue(response.contains("ALL SERVICES UP"));
    }

    @Test
    public void emptyPostBodyServerError(){
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{}").post(baseUrl + "/server/log/serverErrors").then().statusCode(200);
    }
}
