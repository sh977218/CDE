package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardPublisher extends BoardTest {

    @Test
    public void boardPublisher() {
        String newUsername = "boardPublisherTest";
        mustBeLoggedInAs(boardPublisherTest_username, password);
        makePublic("IsItPublic", "You don't have permission to make boards public!");
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Users"));

        findElement(By.id("searchUsersInput")).sendKeys(newUsername);
        clickElement(By.id("searchUsersSubmit"));
        findElement(By.xpath("//div[@id='user_roles_0']//input")).sendKeys("boardp");
        clickElement(By.xpath("//li[. = 'BoardPublisher']"));
        textPresent("Roles saved");
        closeAlert();

        mustBeLoggedInAs(boardPublisherTest_username, password);
        gotoMyBoards();
        makePublic("IsItPublic");
    }

}
