package gov.nih.nlm.form.test.api;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class FormApiSearch extends NlmCdeBaseTest {
    String searchUrl = baseUrl + "/api/form/search";

    @Test
    public void formApiSearchTermSearch() {
        String resp = given().contentType(ContentType.JSON)
                .body("{\"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":27,"));
        Assert.assertTrue(resp.contains("Demographics"));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));
    }

    @Test
    public void formApiSearchStatus() {
        String resp = given().contentType(ContentType.JSON)
                .body("{\"selectedStatuses\": [\"Standard\"], \"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":0,"));
        resp = given().contentType(ContentType.JSON)
                .body("{\"selectedStatuses\": [\"Qualified\"], \"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":27,"));
        Assert.assertTrue(resp.contains("\"registrationStatus\":\"Qualified\""));
    }
}
