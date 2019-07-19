package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CreateUser extends NlmCdeBaseTest {

    @Test
    public void createUser() {
        String newUsername = "Coco Channel";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
        clickElement(By.id("opeNewUserModalBtn"));
        findElement(By.id("newUsername")).sendKeys(newUsername);
        hangon(1);
        clickElement(By.id("createNewUserBtn"));
        checkAlert("User created");
        clickElement(By.id("opeNewUserModalBtn"));
        clickElement(By.id("createNewUserBtn"));
        checkAlert("Cannot create user. Does it already exist?");
        searchUsername("Coco Ch");
        clickElement(By.id("searchUsersSubmit"));
        textPresent("coco channel");
    }

}
