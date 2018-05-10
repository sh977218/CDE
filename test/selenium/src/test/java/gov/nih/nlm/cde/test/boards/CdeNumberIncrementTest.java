package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeNumberIncrementTest extends BoardTest {

    private int getNumberElementsByBoardName(String boardName) {
        WebElement numElt = findElement(By.xpath("//*[@id='" + boardName + "']//*[contains(@class,'numElement')]"));
        int num = Integer.parseInt(numElt.getText().trim());
        return num;
    }

    @Test
    public void cdeNumberIncrement() {
        String boardName = "Number Increment Board";
        mustBeLoggedInAs(boardUser, password);
        gotoMyBoards();
        int numBefore = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(0, numBefore);
        pinCdeToBoard("Lymph Node Procedure", boardName);
        gotoMyBoards();
        int numAfter = getNumberElementsByBoardName(boardName);
        Assert.assertEquals(1, numAfter);
    }

}
