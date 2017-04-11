package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CreateUser extends NlmCdeBaseTest {

    @Test
    public void createUser() {
        String newUsername = "Coco Channel";
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Users"));
        clickElement(By.id("opeNewUserModalBtn"));
        findElement(By.id("newUsername")).sendKeys(newUsername);
        hangon(1);
        clickElement(By.id("createNewUserBtn"));
        textPresent("User created");
        closeAlert();
        findElement(By.name("searchUsersInput")).sendKeys("Coco Ch");
        clickElement(By.id("searchUsersSubmit"));
        textPresent("coco channel");
    }

}
