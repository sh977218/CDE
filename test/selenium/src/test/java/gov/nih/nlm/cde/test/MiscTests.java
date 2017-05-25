package gov.nih.nlm.cde.test;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Header;
import com.jayway.restassured.response.Response;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.HashMap;
import java.util.Map;

import static com.jayway.restassured.RestAssured.get;

public class MiscTests extends NlmCdeBaseTest {

    @Test
    public void gridView() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-AECC"));
        textPresent("NCI Standard Template");
        clickElement(By.id("cde_gridView"));
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

        clickElement(By.id("cde_summaryView"));
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

        Map<String, String> body = new HashMap<String, String>();
        body.put(username, username);
        body.put(password, password);
        String tgtUrl = "https://vsac.nlm.nih.gov:443/vsac/ws/Ticket";
        String contentType = "application/x-www-form-urlencoded";
        String bodyString = "{username:\"cdevsac\",password:\"Aa!!!000\"}";
//        String tgt = post(tgtUrl, body).asString();
        Header header = new Header("Content-Type", "application/x-www-form-urlencoded");
        Response response = RestAssured.given().body(body).header(header).request().post(tgtUrl);
        String tgt = response.asString();

        System.out.println("tgt: " + tgt);
/*
.formParam("username", username).formParam("password", password)
        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals("Not logged in.", response);

        // Provide fake ticket and make sure user info is retrieved
        response = get(baseUrl + "/user/me?ticket=valid").asString();
        get(baseUrl + "/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("_id"), "actualResponse: " + response);
        Assert.assertTrue(response.contains("ninds"), "actualReponse: " + response);

*/
    }

    @Test
    public void checkTicketInvalid() {
        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals("Not logged in.", response);

        // Provide fake invalid ticket and make sure user info is NOT retrieved
        response = get(baseUrl + "/user/me?ticket=invalid").asString();
        Assert.assertEquals("Not logged in.", response);
    }

    @Test
    public void checkSchemas() {
        Assert.assertTrue(get(baseUrl + "/schema/cde").asString().contains("{\"title\":\"DataElement\",\"type\":\"object\",\"properties\":{\"elementType\":{\"type\":\"string\",\"default\":\"cde\",\"description\":\"This value is always 'cde'\"},\"naming\":{\"type\":\"array\","));

        Assert.assertTrue(get(baseUrl + "/schema/form").asString().contains("{\"title\":\"Form\",\"type\":\"object\",\"properties\":{\"elementType\":{\"type\":\"string\",\"default\":\"form\"},\"tinyId\":{\"type\":\"string\"},\"naming\":{\"type\":\"array\",\"items\":{\"title\":\"itemOf_naming\",\"type\":\"object\",\"properties\":{\"designation\":"));

    }

}
