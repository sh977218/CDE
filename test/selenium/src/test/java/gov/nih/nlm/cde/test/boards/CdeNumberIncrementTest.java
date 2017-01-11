package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeNumberIncrementTest extends BoardTest {

    @Test
    public void cdeNumberIncrement() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Number Increment Board";
        gotoMyBoards();
        WebElement numElt = null;
        int num = 0;
        int length = driver.findElements(By.xpath("//*[@class='my-board-card']")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("board_name_" + i)).getText();
            if (boardName.equals(name)) {
                numElt = findElement(By.id("board_num_cdes_" + i));
            }
        }
        if (numElt != null) {
            num = Integer.parseInt(numElt.getText().trim());
        }
        Assert.assertEquals(0, num);
        pinCdeToBoard("Lymph Node Procedure", boardName);
        gotoMyBoards();
        textPresent(boardName);
        length = driver.findElements(By.xpath("//*[@class='my-board-card']")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("board_name_" + i)).getText();
            if (boardName.equals(name)) {
                numElt = findElement(By.id("board_num_cdes_" + i));
            }
        }

        num = Integer.parseInt(numElt.getText().trim());
        Assert.assertEquals(1, num);
    }

}
