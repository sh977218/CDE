package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class FormSearchInputs extends NlmCdeBaseTest {

    @Test
    public void formSearchInputs() {
        given().body("{\"resultsPerPage\": 200}").post(baseUrl + "/elasticSearch/form").then().statusCode(422);
        given().body("{\"from\": 10000}").post(baseUrl + "/elasticSearch/form").then().statusCode(422);

        String resp = given().body("{\"fullRecord\": true}").post(baseUrl + "/elasticSearch/form").asString();
        Assert.assertTrue(resp.contains("flatProperties"));
    }

}
