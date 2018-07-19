package gov.nih.nlm.cde.test.permissibleValue;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static com.jayway.restassured.RestAssured.given;

public class CdePVLoincTest extends NlmCdeBaseTest {
    String[] urls = new String[]{
            "/de/mkmhYJOnk7l",
            "/de/mkmhYJOnk7l/version/",
            "/deById/559d7fae9c174b8015072624/",
            "/deById/559d7fae9c174b8015072624/priorDataElements/",
            "/deList/mkmhYJOnk7l"
    };

    @Test
    public void cdeNotLoginCannotSeeLoinc() {
        mustBeLoggedOut();
        for (String url : urls) {
            String response = given().when().get(baseUrl + url).asString();
            Assert.assertFalse(response.contains("LA6270-8"), "Found LA6270-8 in url: " + url + "\n");
        }
    }

    @Test
    public void cdeLoginCanSeeLoinc() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        for (String url : urls) {
            String response = given().when().get(baseUrl + url).asString();
            Assert.assertTrue(response.contains("LA6270-8"), "Did not LA6270-8 in url: " + url + "\n");
        }
    }
}
