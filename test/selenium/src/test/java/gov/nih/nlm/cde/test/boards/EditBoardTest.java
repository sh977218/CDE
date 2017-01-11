package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditBoardTest extends BoardTest {

    @Test
    public void editBoard() {
        mustBeLoggedInAs(boarduserEdit_username, password);
        gotoMyBoards();
        String modified = findElement(By.id("board_mod_0")).getText();

        clickElement(By.xpath("//*[@id='board_desc_0']//i"));
        findElement(By.xpath("//*[@id='board_desc_0']//input")).sendKeys(" -- Desc Edited");
        clickElement(By.xpath("//div[@id='board_desc_0']//button[contains(text(),'Confirm')]"));
        closeAlert();
        driver.navigate().refresh();
        textPresent("-- Desc Edited");
    }

}
