package gov.nih.nlm.form.test.drafts;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;
import static io.restassured.RestAssured.get;
import static io.restassured.RestAssured.given;

public class FormForEdit extends NlmCdeBaseTest {

    @Test
    public void forEditByTinyIdVersion() {
        String resp = get(baseUrl + "/formForEdit/XJzVz1TZDe/version/v1.0 2014Jul2").asString();
        Assert.assertTrue(resp.contains("NIDA Clinical"), "actually: " + resp);
    }

    @Test
    public void draftSave() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"tinyId\": \"QktaN3OFL1\", \"_id\": \"5d60123aba5e11ce43a7d457\"}")
                .put(baseUrl + "/draftForm/my9q6NmEb").then().statusCode(400);
    }

    @Test
    public void originalSource() {
        get(baseUrl + "/originalSource/form/sourceName/tinyId").then().statusCode(404);
    }

}
