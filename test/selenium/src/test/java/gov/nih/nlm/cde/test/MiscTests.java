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
        String apikey = "64c6db1d-70ef-4f65-b952-c3296cffe8bb";

        String notAuthenticatedResponse = get(baseUrl + "/de/7yXnzmPgZ").asString();
        Assert.assertTrue(notAuthenticatedResponse.contains("Login to see the value."));
        Assert.assertFalse(notAuthenticatedResponse.contains("LA22878-5"));

        String authenticatedResponse = given().queryParam("apiKey", apikey).get(baseUrl + "/de/7yXnzmPgZ").asString();
        Assert.assertFalse(authenticatedResponse.contains("Login to see the value."));
        Assert.assertTrue(authenticatedResponse.contains("LA22878-5"));
    }

    @Test
    public void checkSchemas() {
        Assert.assertTrue(get(baseUrl + "/de/schema").asString().contains("{\"title\":\"DataElement\""));

        Assert.assertTrue(get(baseUrl + "/schema/form").asString().contains("{\"title\":\"Form\""));

        Assert.assertTrue(get(baseUrl + "/schema/cde?type=xml").asString().contains("<xs:schema"));
    }

    @Test
    public void whenArticleWrongKey_then400() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{key:'notWhatsNew'}").post(baseUrl + "/server/article/whatsNew").then().statusCode(400);
    }

    @Test
    public void siteStatus() {
        String response = get(baseUrl + "/server/system/status/cde").asString();
        Assert.assertTrue(response.contains("ALL SERVICES UP"));
    }

    @Test
    public void emptyPostBodyServerError(){
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{}").post(baseUrl + "/server/log/serverErrors").then().statusCode(200);
    }
}
