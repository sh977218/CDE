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
            driver.get(baseUrl + url);
            textNotPresent("LA6270-8");
        }
    }

    @Test
    public void cdeLoginCanSeeLoinc() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        for (String url : urls) {
            driver.get(baseUrl + url);
            textPresent("LA6270-8");
        }
    }
}
