package gov.nih.nlm.cde.test.attachments;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import io.restassured.http.Cookie;
import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class CdeAttachmentTest extends BaseAttachmentTest {

    @Test
    public void cdeAttachment() {
        String cdeName = "Family Assessment Device (FAD) - Discuss problem indicator";

        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        goToAttachments();
        textNotPresent("Upload more files");

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);
        goToAttachments();

        addAttachment("glass.jpg");
        textPresent("cannot be downloaded");

        logout();
        mustBeLoggedInAs(attachmentReviewer_username, password);

        goToCdeByName(cdeName);
        goToAttachments();
        findElement(By.linkText("glass.jpg"));
        clickElement(By.cssSelector("[data-id = 'notifications']"));
        clickElement(By.xpath("//div[contains(@class, 'taskItem')][*//div[contains(text(),'glass.jpg')]]//button[*[contains(text(),'Approve')]]"));

        logout();
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        setAttachmentDefault();
        logout();
        openCdeInList(cdeName);
        findElement(By.cssSelector("img.cdeAttachmentThumbnail"));
        goToCdeByName(cdeName);

        checkAttachmentReviewed("glass.jpg");

        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

        removeAttachment("glass.jpg");
    }


    @Test
    public void checkErrors() {
        mustBeLoggedInAs(reguser_username, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("").post(baseUrl + "/server/attachment/add").then().statusCode(400);

        Response resp = given().cookie(myCookie).body("{\"id\": \"5aa6dd751217150ae0a19800\"")
                .post(baseUrl + "/server/attachment/add");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().toString().contains("You do not own"));


        resp = given().cookie(myCookie).body("{\"id\": \"5aa6dd751217150ae0a19800\"")
                .post(baseUrl + "/server/attachment/remove");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().toString().contains("You do not own"));

        resp = given().cookie(myCookie).body("{\"id\": \"5aa6dd751217150ae0a19800\"")
                .post(baseUrl + "/server/attachment/setDefault");
        Assert.assertEquals(resp.getStatusCode(), 401);
        Assert.assertTrue(resp.getBody().toString().contains("You do not own"));

    }

}
