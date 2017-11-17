package gov.nih.nlm.cde.test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Header;
import com.jayway.restassured.response.Response;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.get;

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
        String username = "cdevsac";
        String password = "Aa!!!000";
        String tgtUrl = "https://vsac.nlm.nih.gov:443/vsac/ws/Ticket";

        // Test to make sure user isn't logged in
        String notLoggedInResponse = get(baseUrl + "/user/me").asString();
        Assert.assertEquals(notLoggedInResponse, "{}");

        Header header = new Header("Content-Type", "application/x-www-form-urlencoded");
        Response tpgResponse = RestAssured.given().formParam("username", username).formParam("password", password).header(header).request().post(tgtUrl);
        String tgt = tpgResponse.asString();
        System.out.println("got tgt: " + tgt);

        String ticketUrl = "https://vsac.nlm.nih.gov/vsac/ws/Ticket/" + tgt;
        Response ticketResponse = RestAssured.given().formParam("service", "http://umlsks.nlm.nih.gov").header(header).request().post(ticketUrl);
        String ticket = ticketResponse.asString();
        System.out.println("got ticket: " + ticket);

        String actualResponse = get(baseUrl + "/user/me?ticket=" + ticket).asString();
        Assert.assertTrue(actualResponse.contains("_id"), "actualResponse: " + actualResponse);
        Assert.assertTrue(actualResponse.contains(username), "actualResponse: " + actualResponse);
        Assert.assertFalse(actualResponse.contains(password), "actualResponse: " + actualResponse);

    }

    @Test
    public void checkTicketInvalid() {
        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals(response, "{}");

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl + "/user/me?ticket=invalid").asString();
        Assert.assertEquals(response, "{}");
    }

    @Test
    public void checkSchemas() {
        Assert.assertTrue(get(baseUrl + "/schema/cde").asString().contains("{\"title\":\"DataElement\",\"type\":\"object\",\"properties\":{\"elementType\":{\"type\":\"string\",\"default\":\"cde\",\"description\":\"This value is always 'cde'\"},\"naming\":{\"type\":\"array\","));

        Assert.assertTrue(get(baseUrl + "/schema/form").asString().contains("{\"title\":\"Form\",\"type\":\"object\",\"properties\":{\"elementType\":{\"type\":\"string\",\"default\":\"form\"},\"tinyId\":{\"type\":\"string\"},\"naming\":{\"type\":\"array\",\"items\":{\"title\":\"itemOf_naming\",\"type\":\"object\",\"properties\":{\"designation\":"));

    }

}
