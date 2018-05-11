package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditBoardTest extends BoardTest {

    @Test
    public void editBoard() {
        mustBeLoggedInAs(boarduserEdit_username, password);
        gotoMyBoards();
        String boardName = "Edit Board";
        String boardNameChange = " NEW";
        String boardDescriptionChange = "-- Desc Edited";
        String[] boardTags = new String[]{"tag1", "tag2", "tag3"};
        editBoardByName(boardName, boardNameChange, boardDescriptionChange, false, boardTags);
        textPresent(boardNameChange);
        textPresent(boardDescriptionChange);
        textPresent(boardDescriptionChange);
    }

}
