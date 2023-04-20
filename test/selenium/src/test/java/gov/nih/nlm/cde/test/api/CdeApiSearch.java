package gov.nih.nlm.cde.test.api;

import gov.nih.nlm.cde.test.MiscTests;
import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static io.restassured.RestAssured.given;

public class CdeApiSearch extends MiscTests {
    String searchUrl = baseUrl + "/api/de/search";

    @Test
    public void cdeApiSearchTermSearch() {
        String resp = given().contentType(ContentType.JSON)
                .body("{\"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":19,"));
        Assert.assertTrue(resp.contains("\"permissibleValue\":\"African-North\""));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));

        Assert.assertFalse(resp.contains("LA6270-8"));
        Assert.assertFalse(resp.contains("LA10066-1"));
        Assert.assertTrue(resp.contains("Login to see the value."));
    }

    @Test
    public void cdeApiSearchTermSearchUmls() {
        String apikey = checkTicketValid();

        String resp = given().contentType(ContentType.JSON)
                .queryParam("apiKey", apikey)
                .body("{\"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":19,"));
        Assert.assertTrue(resp.contains("\"permissibleValue\":\"African-North\""));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));

        Assert.assertTrue(resp.contains("LA6270-8"));
        Assert.assertTrue(resp.contains("LA10066-1"));
        Assert.assertFalse(resp.contains("Login to see the value."));
    }

    @Test
    public void cdeApiSearchStatus() {
        String resp = given().contentType(ContentType.JSON)
                .body("{\"selectedStatuses\": [\"Standard\"], \"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":1,"));
        Assert.assertTrue(resp.contains("\"registrationStatus\":\"Standard\""));
        Assert.assertTrue(resp.contains("\"datatype\":\"Value List\","));
    }

    @Test
    public void cdeApiSearchDatatypes() {
        String resp = given().contentType(ContentType.JSON)
                .body("{\"selectedDatatypes\": [\"Number\"], \"searchTerm\": \"race\"}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":2,"));
        Assert.assertTrue(resp.contains("\"datatype\":\"Number\","));

    }

    @Test
    public void cdeApiSearchSortOrderPagination() {
        /* Sort Order and Pagination */
        Pattern tinyIdPattern = Pattern.compile("\"tinyId\":\"[a-zA-Z0-9_]+\"");
        Matcher m;
        int i;
        String[] expected;

        String resp = given().contentType(ContentType.JSON)
                .body("{\"searchTerm\": \"date and study en*\", \"resultPerPage\": 4}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":53,\"resultsRetrieved\":4,\"from\":1"), resp.substring(0, 100));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));
        m = tinyIdPattern.matcher(resp);
        i = 0;
        expected = new String[]{
                "76pp4oq7mMV", "GKGz5Eh2Ey1", "pdM9DX2v0V4", "HFGF_eOS1AX"
        };
        while (m.find()) {
            Assert.assertEquals(m.group(), "\"tinyId\":\"" + expected[i] + "\"", "Search result does not match GUI");
            i++;
        }
        Assert.assertEquals(i, 4, "Results per page is not correct");

        resp = given().contentType(ContentType.JSON)
                .body("{\"searchTerm\": \"date and study en*\", \"resultPerPage\": 4, \"page\": 2}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":53,\"resultsRetrieved\":4,\"from\":5"), resp.substring(0, 100));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));
        m = tinyIdPattern.matcher(resp);
        i = 0;
        expected = new String[]{
                "Wf9qPBhVPso", "8RYxVyOn9_m", "W7NA2_0aBjw", "Hh4NkfngOn9"
        };
        while (m.find()) {
            Assert.assertEquals(m.group(), "\"tinyId\":\"" + expected[i] + "\"", "Search result does not match GUI");
            i++;
        }
        Assert.assertEquals(i, 4, "Results per page is not correct");
    }

    // To cover some code for coverage
    @Test
    public void cdeApiSearchForCodeCoverage() {
        String searchUrl = baseUrl + "/api/de/search";
        String resp = given().contentType(ContentType.JSON)
                .body("{\"searchTerm\": \"date and study en*\", \"resultPerPage\": 200}")
                .post(searchUrl).asString();
        Assert.assertTrue(resp.contains("\"resultsTotal\":53,\"resultsRetrieved\":53,\"from\":1"), resp.substring(0, 100));
        Assert.assertFalse(resp.contains("primaryNameCopy"));
        Assert.assertFalse(resp.contains("flatClassifications"));

    }

}
