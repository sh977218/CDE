package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.Cookie;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class ClassifyCdesInFormTest extends NlmCdeBaseTest {

    @Test
    public void classifyCdesInForm() {
        String formName = "History Data Source and Reliability";
        mustBeLoggedInAs("ctepOnlyCurator", password);

        goToFormByName(formName);
        goToClassificationForm();
        _addClassificationByTree("CTEP", new String[]{"ABTC", "ABTC 0904"});

        // Verify
        String cdeName1 = "Data source";
        goToCdeByName(cdeName1);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");

        String cdeName2 = "History data reliability type";
        goToCdeByName(cdeName2);
        goToClassification();
        textPresent("ABTC");
        textPresent("ABTC 0904");
    }

    @Test
    public void classifyAllCdesBadInput() {
        mustBeLoggedInAs("ctepOnlyCurator", password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("").post(baseUrl + "/server/classification/bulk/tinyId").then().statusCode(422);
    }

}
