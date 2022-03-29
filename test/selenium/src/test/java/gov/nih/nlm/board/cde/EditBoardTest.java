package gov.nih.nlm.board.cde;

import org.testng.annotations.Test;

public class EditBoardTest extends BoardTest {

    @Test
    public void editBoard() {
        String boardName = "Edit Board";
        String boardNameChange = " NEW";
        String boardDescriptionChange = "-- Desc Edited";
        String[] boardTags = new String[]{"tag1", "tag2", "tag3"};
        mustBeLoggedInAs(boarduserEdit_username, password);
        gotoMyBoards();
        editBoardByName(boardName, boardNameChange, boardDescriptionChange, false, boardTags, "Saved");
        textPresent(boardNameChange);
        textPresent(boardDescriptionChange);
        textPresent(boardDescriptionChange);
    }

}
