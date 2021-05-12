package gov.nih.nlm.cde.test;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class OrgAdminTasks extends BaseClassificationTest {

    @Test
    public void orgAdminTasks() {
        mustBeLoggedInAs(classificationMgtUser_username, password);
        goToCurators();
        new Select(findElement(By.name("newOrgCuratorOrgName"))).selectByVisibleText("caBIG");
        searchUsername("userToPromote");
        clickElement(By.id("newOrgCuratorSubmit"));
        checkAlert("Saved");
        textPresent("userToPromote");
        int orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgCuratorOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgCuratorOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgCuratorUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(
                            By.xpath("//span[@id='existingOrgCuratorUsername-" + i + "-" + j + "']")).getText())) {
                        clickElement(By.xpath("//mat-icon[@id='removeOrgCuratorUsername-" + i + "-" + j + "']"));
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        checkAlert("Removed");
        textNotPresent("userToPromote");

        goToAdmins();
        new Select(findElement(By.id("newOrgAdminOrgName"))).selectByVisibleText("caBIG");
        searchUsername("userToPromote");
        clickElement(By.id("newOrgAdminSubmit"));
        checkAlert("Saved");
        textPresent("userToPromote");
        orgLength = driver.findElements(By.xpath("//td[starts-with(@id, 'existingOrgAdminOrgName-')]")).size();
        for (int i = 0; i < orgLength; i++) {
            if ("caBIG".equals(findElement(By.xpath("//td[@id='existingOrgAdminOrgName-caBIG']")).getText())) {
                int userLength = driver.findElements(By.xpath("//span[starts-with(@id, 'existingOrgAdminUsername-" + i + "-')]")).size();
                for (int j = 0; j < userLength; j++) {
                    if ("userToPromote".equals(findElement(By.xpath("//span[@id='existingOrgAdminUsername-" + i + "-" + j + "']")).getText())) {
                        clickElement(By.xpath("//mat-icon[@id='removeOrgAdminUsername-" + i + "-" + j + "']"));
                        j = userLength;
                        i = orgLength;
                    }
                }
            }
        }
        textPresent("Removed");
        textNotPresent("userToPromote");
    }

    @Test
    public void updateOrgError() {
        mustBeLoggedInAs(orgAuthorityUser_username, password);
        Cookie myCookie = getCurrentCookie();
        given().cookie(myCookie).body("{'_id': 'badID'}")
                .post(baseUrl + "/server/orgManagement/updateOrg").then().statusCode(400);

        given().cookie(myCookie).contentType(ContentType.JSON).body("{\"name\": \"NINDS\"}")
                .post(baseUrl + "/server/orgManagement/addOrg").then().statusCode(409);
    }

    @Test
    public void transferStewardError() {
        mustBeLoggedInAs("ctepAdmin", password);
        Cookie myCookie = getCurrentCookie();

        given().cookie(myCookie).contentType(ContentType.JSON).body("{\"from\": \"NINDS\", \"to\": \"ACRIN\"}")
                .post(baseUrl + "/server/orgManagement/transferSteward").then().statusCode(403);
    }


}
