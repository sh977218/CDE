package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardManagementTest extends BoardTest {

    @Test
    public void boardPublisher() {
        mustBeLoggedInAs(boardPublisherTest_username, password);
        makePublic("IsItPublic", "You don't have permission to make boards public!");
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.linkText("Users"));

        findElement(By.name("searchUsers")).sendKeys("boardPublisherTest");
        clickElement(By.id("searchUsersSubmit"));
        findElement(By.xpath("//div[@id='user_roles_0']//input")).sendKeys("boardp");
        clickElement(By.xpath("//div[@id='user_roles_0']//li/div/span"));
        textPresent("Roles saved");
        closeAlert();

        mustBeLoggedInAs("boardPublisherTest", password);
        gotoMyBoards();
        makePublic("IsItPublic");
    }


    @Test(priority = 4)
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String cdeName = "Specimen Array";

        goToCdeSearch();
        openCdeInList(cdeName);
        clickElement(By.id("pinToBoard_0"));
        textPresent("Click here to create a board now");
        clickElement(By.id("cancelSelect"));
        modalGone();
    }


}
