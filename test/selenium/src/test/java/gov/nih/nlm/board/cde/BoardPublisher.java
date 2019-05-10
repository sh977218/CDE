package gov.nih.nlm.board.cde;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class BoardPublisher extends BoardTest {

    @Test
    public void boardPublisher() {
        String newUsername = "boardPublisherTest";
        mustBeLoggedInAs(boardPublisherTest_username, password);
        gotoMyBoards();
        makePublic("IsItPublic", "You don't have permission to make boards public!");

        logout();
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToUsers();
        searchUsername(newUsername);
        clickElement(By.id("searchUsersSubmit"));
        findElement(By.xpath("//*[@id='user_roles_0']//input")).sendKeys("boardp");
        selectMatSelectDropdownByText("BoardPublisher");
        checkAlert("Roles saved");

        logout();
        mustBeLoggedInAs(boardPublisherTest_username, password);
        gotoMyBoards();
        makePublic("IsItPublic");
    }

}
