package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagement4Test extends BoardTest {
    
    @Test
    public void removeBoard() {
        mustBeLoggedInAs(boardUser, password);
        createBoard("Remove me board", "Not a very useful board");
        removeBoard("Remove me board");
        goToCdeSearch();
        gotoMyBoards();
        Assert.assertTrue(textNotPresent("Not a very useful"));
    }
    
    @Test
    public void cdeNumbIncrement() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Number Increment Board";
        goToCdeSearch();
        createBoard(boardName, "Number Increment Definition");
        gotoMyBoards(); 
        WebElement numElt = null;
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                numElt = findElement(By.id("dd_numb_" + i));
            }
        }        
        int num = new Integer(numElt.getText());
        Assert.assertEquals(0, num);
        pinTo("Lymph Node Procedure", boardName);
        gotoMyBoards();
        textPresent(boardName);
        length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                numElt = findElement(By.id("dd_numb_" + i));
            }
        }

        num = new Integer(numElt.getText());
        Assert.assertEquals(1, num);
        removeBoard("Number Increment Board");
    }
    
    @Test
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boarduser2_username, password);
        String cdeName = "Specimen Array";

        goToCdeSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        Assert.assertTrue(textPresent("Create a board now"));
        findElement(By.id("cancelSelect")).click();
        modalGone();
    }
    
}
