package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import org.junit.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class FormSearchInputs extends NlmCdeBaseTest {

    @Test
    public void formSearchInputs() {
        given().contentType(ContentType.JSON)
                .body("{\"resultPerPage\": 200, \"selectedStatuses\": [], \"visibleStatuses\": []}")
                .post(baseUrl + "/elasticSearch/form").then().statusCode(422);

        given().contentType(ContentType.JSON)
                .body("{\"page\": 600, \"resultPerPage\": 20, \"selectedStatuses\": [], \"visibleStatuses\": []}")
                .post(baseUrl + "/elasticSearch/form").then().statusCode(422);

        String resp = given().contentType(ContentType.JSON)
                .body("{\"fullRecord\": true, \"selectedStatuses\": [], \"visibleStatuses\": []}")
                .post(baseUrl + "/elasticSearch/form").asString();
        Assert.assertTrue(resp.contains("flatProperties"));
    }

}
