package gov.nih.nlm.cde.test.boards;

import static gov.nih.nlm.cde.test.boards.BoardTest.boardUser;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagementTest extends BoardTest {
    
  
    @Test
    public void publicVsPrivateBoards() {
        mustBeLoggedInAs(boardUser, boardPassword);
        String boardName = "Public Board";
        
        createBoard(boardName, "This board will be public");
        pinTo("Heart MUGA", boardName);
        // by default, board is private.

        goToBoard(boardName);
        // I can view my own board.
        Assert.assertTrue(textPresent("MUGA"));
        String url = driver.getCurrentUrl();
        String boardId = url.substring(url.lastIndexOf("/") + 1);
        
        logout();
        driver.get(baseUrl + "/#/board/" + boardId);
        // not logged in, I can't see
        Assert.assertTrue(textNotPresent("Not a very useful"));

        loginAs(ctepCurator_username, ctepCurator_password);
        driver.get(baseUrl + "/#/board/" + boardId);
        // logged in as someone else, I can't see
        Assert.assertTrue(textNotPresent("Not a very useful"));
        
        logout();
        
        loginAs(boardUser, boardPassword);
        makePublic(boardName);
        
        logout();
        
        driver.get(baseUrl + "/#/board/" + boardId);
        // Now I can see;
        Assert.assertTrue(textPresent("MUGA"));

        loginAs(boardUser, boardPassword);
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("publicIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
            }
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("privateIcon_" + i)));
        }
        
        logout();
        
        driver.get(baseUrl + "/#/board/" + boardId);
        // private again, I can't see
        Assert.assertTrue(textNotPresent("Not a very useful"));

        loginAs(boardUser, boardPassword);
        
        removeBoard(boardName);
    }
        
    @Test
    public void removeBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        createBoard("Remove me board", "Not a very useful board");
        removeBoard("Remove me board");
        goToSearch();
        gotoMyBoards();
        Assert.assertTrue(textNotPresent("Not a very useful"));
    }
    
    @Test
    public void cdeNumbIncrement() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goToSearch();
        createBoard("Number Increment Board", "Number Increment Definition");
        gotoMyBoards();           
        WebElement numElt = findElement(By.id("dd_numb"));
        int num = new Integer(numElt.getText());
        Assert.assertEquals(0, num);
        pinTo("Lymph Node Procedure", "Number Increment Board");
        gotoMyBoards();           
        numElt = findElement(By.id("dd_numb"));
        num = new Integer(numElt.getText());
        Assert.assertEquals(1, num);
        removeBoard("Number Increment Board");
    }
    
    @Test
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        String cdeName = "Specimen Array";

        goToSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();
        Assert.assertTrue(textPresent("Create a board now"));
        findElement(By.id("cancelSelect")).click();
        modalGone();
    }
    
    @Test
    public void editBoard() {
        mustBeLoggedInAs("boarduserEdit", boardPassword);
        createBoard("Edit Board", "Test");
        gotoMyBoards();
        String mod = findElement(By.id("dd_mod")).getText();
        findElement(By.id("name_edit_0")).click();
        findElement(By.id("name_input_0")).sendKeys(" -- Name Edited");
        findElement(By.id("name_confirm_0")).click();

        Assert.assertTrue(textPresent("Saved"));

        findElement(By.id("desc_edit_0")).click();
        findElement(By.id("desc_input_0")).sendKeys(" -- Desc Edited");
        findElement(By.id("desc_confirm_0")).click();
        
        goToSearch();
        gotoMyBoards();
        Assert.assertTrue(textPresent("-- Name Edited"));
        Assert.assertTrue(textPresent("-- Desc Edited"));
        
        Assert.assertNotEquals(mod + " --- " + findElement(By.id("dd_mod")).getText(), mod, findElement(By.id("dd_mod")).getText());
        
        removeBoard("Edit Board -- Name Edited");
    }
    
    @Test
    public void searchBoard() {
        hangon(.5);
        mustBeLoggedInAs(boardUser, boardPassword);
        String pubBlood = "Public Blood Board";
        String privBlood = "Private Blood Board";
        String pubSmoking = "Public Smoking Board";
        
        createBoard(pubBlood, "");
        createBoard(privBlood, "");
        createBoard(pubSmoking, "");
        
        makePublic(pubBlood);
        makePublic(pubSmoking);
        modalGone();
        gotoPublicBoards();
        
        findElement(By.name("search")).sendKeys("Blood");
        findElement(By.id("search.submit")).click();
        
        Assert.assertTrue(textPresent(pubBlood));

        Assert.assertTrue(textNotPresent("Smoking"));
        Assert.assertTrue(textNotPresent("Private"));
        
        removeBoard(pubBlood);
        removeBoard(privBlood);
        removeBoard(pubSmoking);
        
    }

    @Test
    public void cdeBoards() {
        hangon(.5);
        mustBeLoggedInAs("boarduser1", boardPassword);
        String board1 = "First CDE Board";
        String board2 = "Second CDE Board";
        
        createBoard(board1, "");
        createBoard(board2, "");
        
        makePublic(board1);
        
        pinTo("Biomarker Outcome", board1);
        pinTo("Biomarker Outcome", board2);
        
        goToCdeByName("Biomarker Outcome");
        findElement(By.xpath("//li[@heading='Boards']/a")).click();
        
        Assert.assertTrue(textPresent(board1));
        Assert.assertTrue(textNotPresent(board2));

        makePublic(board2);

        hangon(2);
        goToCdeByName("Biomarker Outcome");
        findElement(By.xpath("//li[@heading='Boards']/a")).click();
        
        Assert.assertTrue(textPresent(board1));
        Assert.assertTrue(textPresent(board2));
        
        removeBoard(board1);
        removeBoard(board2);
    }  
    
    @Test
    public void pagination() {
        mustBeLoggedInAs(ninds_username, ninds_password);
        gotoMyBoards();
        findElement(By.linkText("View Board")).click();
        findElement(By.linkText("30")).click();
        Assert.assertTrue(textPresent("Word discrimination result"));
        Assert.assertTrue(textPresent("Volumetric Measurement Left Limb Testing Result"));
        Assert.assertTrue(textPresent("Walking difficulty age need intermittent support not applicable indicator"));
        Assert.assertTrue(textPresent("Water reference data acquisition data acquisition time"));
    }        
}
