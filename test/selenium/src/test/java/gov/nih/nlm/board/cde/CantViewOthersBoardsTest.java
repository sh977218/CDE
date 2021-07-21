package gov.nih.nlm.board.cde;

import org.testng.annotations.Test;

public class CantViewOthersBoardsTest extends BoardTest{

    @Test
    void cantViewOthersBoards(){
        mustBeLoggedInAs(pinUser, password);
        String boardName = "Blood Board";
        goToBoard(boardName);

        textPresent("Laboratory Procedure Blood Urea Nitrogen");
        textPresent("Umbilical Cord Blood");

        String url = driver.getCurrentUrl();

        logout();
        driver.get(url);
        checkAlert("Board Not Found");

        mustBeLoggedInAs(orgAdminUser_username, password);
        driver.get(url);
        checkAlert("Board Not Found");

    }

}
