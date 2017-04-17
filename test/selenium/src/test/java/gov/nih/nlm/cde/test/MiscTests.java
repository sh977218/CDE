package gov.nih.nlm.cde.test;


import com.jayway.restassured.http.ContentType;
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
        // Test to make sure user isn't logged in
        String response = get(baseUrl + "/user/me").asString();
        Assert.assertEquals("Not logged in.", response);

        // Provide fake ticket and make sure user info is retrieved
        response = get(baseUrl + "/user/me?ticket=valid").asString();
        get(baseUrl + "/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("_id"), "actualResponse: " + response);
        Assert.assertTrue(response.contains("ninds"), "actualReponse: " + response);
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
    public void checkConnectionTimeout() {

        // Make sure ticket validation times out
        String response = get(baseUrl + "/user/me?ticket=timeout4").asString();
        Assert.assertEquals("Not logged in.", response);

        // Make sure ticket validation doesn't times out
        response = get(baseUrl + "/user/me?ticket=timeout1").asString();
        get(baseUrl + "/user/me?ticket=valid").then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("_id"), "Does not contain _id. Actual response: " + response);
        Assert.assertTrue(response.contains("ninds"), "Does not contain ninds. Actual Response: " + response);
    }

    @Test
    public void checkSchemas () {
        Assert.assertTrue(get(baseUrl + "/schema/cde").asString().contains("{\"naming\":{\"schema\":{\"paths\":{\"designation\":{\"enumValues\":[],\"path\":\"designation\",\"instance\":\"String\"}"));

        Assert.assertTrue(get(baseUrl + "/schema/cde").asString().contains(",\"naming\":{\"schema\":{\"paths\":{\"designation\":{\"enumValues\":[],\"path\":\"designation\",\"instance\":\"String\"}"));

    }

}
