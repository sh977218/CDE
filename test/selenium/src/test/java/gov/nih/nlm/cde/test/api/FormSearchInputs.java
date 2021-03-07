package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import org.junit.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class FormSearchInputs extends NlmCdeBaseTest {

    @Test
    public void formSearchInputs() {
        String formSearchUrl = baseUrl + "/server/form/search";

        given().contentType(ContentType.JSON)
                .body("{\"page\": 600, \"resultPerPage\": 20, \"selectedStatuses\": []}")
                .post(formSearchUrl).then().statusCode(422);

        String resp = given().contentType(ContentType.JSON)
                .body("{\"fullRecord\": true, \"selectedStatuses\": []}")
                .post(formSearchUrl).asString();
        Assert.assertTrue(resp.contains("flatProperties"));
    }

}
