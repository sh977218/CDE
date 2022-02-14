package gov.nih.nlm.system;

import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;

public class CreateUser extends NlmCdeBaseTest {

    @Test
    public void createUser() {
        String newUsername = "Coco Channel";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
        clickElement(By.xpath("//button[contains(.,'Create User')]"));
        findElement(By.id("newUsername")).sendKeys(newUsername);
        hangon(1);
        clickElement(By.id("createNewUserBtn"));
        checkAlert("User created");
        clickElement(By.xpath("//button[contains(.,'Create User')]"));
        clickElement(By.id("createNewUserBtn"));
        checkAlert("Cannot create user. Does it already exist?");
        searchUsername("Coco Ch");
        clickElement(By.xpath("//button[text()='Search']"));
        textPresent("coco channel");
    }

    @Test
    public void createUserDuplicate() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        Cookie myCookie = getCurrentCookie();
        given().contentType(ContentType.JSON).cookie(myCookie)
                .body("{\"username\": \"nlm\"}")
                .post(baseUrl + "/server/user/addUser").then().statusCode(409);

    }

}
