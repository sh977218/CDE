package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.get;
import static io.restassured.RestAssured.given;

public class FormForEdit extends NlmCdeBaseTest {

    @Test
    public void forEditByTinyIdVersion() {
        System.out.println(baseUrl);

        String resp = get(baseUrl + "/formForEdit/XJzVz1TZDe/version/v1.0%202014Jul2").asString();
        Assert.assertTrue(resp.contains("NIDA Clinical"), "actually: " + resp);
    }

    @Test
    public void draftSave() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"elt\": {\"tinyId\": \"b\"}}").put(baseUrl + "/draftForm/a").then().statusCode(400);

    }

}
