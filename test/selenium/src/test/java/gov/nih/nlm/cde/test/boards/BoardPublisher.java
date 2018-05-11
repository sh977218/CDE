package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardPublisher extends BoardTest {

    @Test
    public void boardPublisher() {
        String newUsername = "boardPublisherTest";
        mustBeLoggedInAs(boardPublisherTest_username, password);
        gotoMyBoards();
        makePublic("IsItPublic", "You don't have permission to make boards public!");
        mustBeLoggedInAs(nlm_username, nlm_password);
        openUserMenu();
        goToSiteManagement();
        clickElement(By.linkText("Users"));

        findElement(By.id("searchUsersInput")).sendKeys(newUsername);
        clickElement(By.id("searchUsersSubmit"));
        findElement(By.xpath("//*[@id='user_roles_0']/ng-select//input")).sendKeys("boardp");
        selectNgSelectDropdownByText("BoardPublisher");
        checkAlert("Roles saved");

        mustBeLoggedInAs(boardPublisherTest_username, password);
        gotoMyBoards();
        makePublic("IsItPublic");
    }

}
