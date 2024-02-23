package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.system.NlmCdeBaseTest;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.Random;

import static io.restassured.RestAssured.given;

public class CdeAttachmentTest extends NlmCdeBaseTest {

    @Test
    public void attachmentErrors() throws IOException {
        mustBeLoggedInAs(nlmCuratorUser_username, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("").post(baseUrl + "/server/attachment/cde/add").then().statusCode(400);

        Random rand = new Random();
        final File tempFile = File.createTempFile("attachmentErrorSample_" + rand.nextInt(10000000), ".tmp");
        tempFile.deleteOnExit();

        Response resp = given().cookie(myCookie)
                .contentType("multipart/form-data")
                .multiPart("uploadedFiles", tempFile)
                .multiPart("id", "5aa6dd751217150ae0a19800")
                .post(baseUrl + "/server/attachment/cde/add");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().print().contains("You do not own"));


        resp = given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"id\": \"5aa6dd751217150ae0a19800\"}")
                .post(baseUrl + "/server/attachment/cde/remove");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().print().contains("You do not own"));

        resp = given().cookie(myCookie).contentType(ContentType.JSON)
                .body("{\"id\": \"5aa6dd751217150ae0a19800\"}")
                .post(baseUrl + "/server/attachment/cde/setDefault");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().print().contains("You do not own"));

    }

}
