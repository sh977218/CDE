package gov.nih.nlm.cde.test.uts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;

public class MiscUTS extends NlmCdeBaseTest{

    @Test
    public void wrongSource() {
        String response = get(baseUrl + "/server/uts/umlsPtSource/111/WRONG").asString();
        Assert.assertEquals(response, "Source cannot be looked up, use UTS instead.");

        response = get(baseUrl + "/server/uts/umlsAtomsBridge/111/WRONG").asString();
        Assert.assertEquals(response, "Source cannot be looked up, use UTS instead.");

        response = get(baseUrl + "/server/uts/umlsCuiFromSrc/111/WRONG").asString();
        Assert.assertEquals(response, "Source cannot be looked up, use UTS instead.");
    }

    @Test
    public void needToLogin() {
        get(baseUrl + "/server/uts/umlsPtSource/111/LNC").then().statusCode(403);
        get(baseUrl + "/server/uts/umlsAtomsBridge/111/LNC").then().statusCode(403);
    }

    // TODO Re-enable
//    @Test
//    public void valueSetTerm() {
//        String response = get(baseUrl + "/server/uts/searchValueSet/2.16.840.1.113883.3.526.2.39?" +
//                "term=azilsartan%20medoxomil%2040%20MG%20Oral%20Tablet").asString();
//        Assert.assertTrue(response.contains("records\":1"));
//        Assert.assertTrue(response.contains("displayname\":\"azilsartan medoxomil 40 MG Oral Tablet\""));
//    }
//
//    @Test
//    public void valueSetPage() {
//        String response = get(baseUrl + "/server/uts/searchValueSet/2.16.840.1.113883.3.526.2.39?page=2").asString();
//        Assert.assertTrue(response.contains("page\":2"), "actual: " + response);
//    }
//

}
