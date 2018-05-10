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

    void editBoardByName(String boardName, String boardNameChange, String boardDescriptionChange, boolean isPublic, String[] boardTags) {
        clickElement(By.xpath("//*[@id='" + boardName + "']//i[contains(@class,'editBoard')]"));
        findElement(By.id("boardName")).sendKeys(boardNameChange);
        findElement(By.id("boardDescription")).sendKeys(boardDescriptionChange);
        if (boardTags != null) {
            for (String tag : boardTags) {
                clickElement(By.xpath("//*[@id='boardTag']//input"));
                findElement(By.xpath("//*[@id='boardTag']//input")).sendKeys(tag);
                selectNgSelectDropdownByText(tag);
            }
        }
        clickElement(By.id("saveEditBoardBtn"));
        closeAlert();
    }

}
