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
        clickElement(By.id("createNewUserBtn"));
        checkAlert("User created");
        searchUsername("Coco Ch", "coco channel");
        clickElement(By.xpath("//button[text()='Search']"));
        textPresent("coco channel");
    }

    @Test(dependsOnMethods={"createUser"})
    public void cannotCreateDuplicateUser(){
        String newUsername = "Coco Channel";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
        clickElement(By.xpath("//button[contains(.,'Create User')]"));
        findElement(By.id("newUsername")).sendKeys(newUsername);
        clickElement(By.id("createNewUserBtn"));
        checkAlert("Cannot create user. Does it already exist?");
        searchUsername("Coco Ch",  "coco channel");
        clickElement(By.xpath("//button[text()='Search']"));
        textPresent("coco channel");
    }
}
