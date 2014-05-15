package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardTest extends NlmCdeBaseTest {
    
    private static final String boardUser = "boarduser";
    private static final String boardPassword = "pass";
    
    private void makePublic(String boardName) {
        findElement(By.linkText("My Boards")).click();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("privateIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("publicIcon_" + i)));
                hangon(1);
                return;
            } 
        }
    }
    
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
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Not a very useful") < 0);

        loginAs(ctepCurator_username, ctepCurator_password);
        driver.get(baseUrl + "/#/board/" + boardId);
        // logged in as someone else, I can't see
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Not a very useful") < 0);
        
        logout();
        
        loginAs(boardUser, boardPassword);
        makePublic(boardName);
        
        logout();
        
        driver.get(baseUrl + "/#/board/" + boardId);
        // Now I can see;
        Assert.assertTrue(textPresent("MUGA"));

        loginAs(boardUser, boardPassword);
        findElement(By.linkText("My Boards")).click();
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
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Not a very useful") < 0);

        loginAs(boardUser, boardPassword);
        
        removeBoard(boardName);
    }
    
    private void createBoard(String name, String description) {
        findElement(By.linkText("My Boards")).click();
        findElement(By.id("addBoard")).click();
        findElement(By.name("name")).sendKeys(name);
        findElement(By.name("description")).sendKeys(description);
        findElement(By.id("createBoard")).click();
        modalGone();
    }
    
    private void removeBoard(String boardName) {
        findElement(By.linkText("My Boards")).click();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("removeBoard-" + i)).click();
                findElement(By.id("confirmRemove-" + i)).click();
                hangon(1);
                Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(boardName) < 0);
                return;
            }
        }
    }
    
    @Test
    public void removeBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        createBoard("Remove me board", "Not a very useful board");
        removeBoard("Remove me board");
        goHome();
        findElement(By.linkText("My Boards")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Not a very useful") < 0);
    }
    
    private void pinTo(String cdeName, String boardName) {
        goHome();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();        
        findElement(By.linkText(boardName)).click();
        modalGone();
        Assert.assertTrue(textPresent("Added to Board"));    
    }
    
    private void goToBoard(String boardName) {
        findElement(By.linkText("My Boards")).click();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("view_" + i)).click();
                return;
            }
        }
    }
    
    @Test
    public void cdeNumbIncrement() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goHome();
        createBoard("Number Increment Board", "Number Increment Definition");
        findElement(By.linkText("My Boards")).click();           
        WebElement numElt = findElement(By.id("dd_numb"));
        int num = new Integer(numElt.getText());
        Assert.assertEquals(0, num);
        pinTo("Lymph Node Procedure", "Number Increment Board");
        findElement(By.linkText("My Boards")).click();           
        numElt = findElement(By.id("dd_numb"));
        num = new Integer(numElt.getText());
        Assert.assertEquals(1, num);
        removeBoard("Number Increment Board");
    }
    
    @Test
    public void pin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goHome();
        createBoard("Blood Board", "Collect blood related cdes here");
        createBoard("Smoking Board", "Collect Smoking CDEs here");
        
        findElement(By.linkText("My Boards")).click();           
        Assert.assertTrue(textPresent("Collect blood"));
        Assert.assertTrue(textPresent("Smoking CDEs"));

        pinTo("Laboratory Procedure Blood Urea Nitrogen", "Blood Board");
        pinTo("Umbilical Cord Blood", "Blood Board");
        pinTo("Smoking History", "Smoking Board");
        pinTo("Form Element End Date", "Smoking Board");
        
        goToBoard("Smoking Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 2);
        Assert.assertTrue(textPresent("Smoking History"));
        Assert.assertTrue(textPresent("Form Element End Date"));

        goToBoard("Blood Board");
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 2);
        Assert.assertTrue(textPresent("Laboratory Procedure Blood Urea Nitrogen"));
        Assert.assertTrue(textPresent("Umbilical Cord Blood"));
        
        removeBoard("Blood Board");
        removeBoard("Smoking Board");

    }

    @Test
    public void noDoublePin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goHome();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";
        
        createBoard(boardName, "test");
        pinTo(cdeName, boardName);
        
        goHome();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();
        findElement(By.linkText(boardName)).click();
        
        Assert.assertTrue(textPresent("Already added"));
        modalGone();
        
        goToBoard(boardName);
        Assert.assertEquals(driver.findElements(By.cssSelector("div.panel-default")).size(), 1);
        
        removeBoard(boardName);
    }
    
    @Test
    public void unpin() {
        mustBeLoggedInAs(boardUser, boardPassword);
        goHome();
        createBoard("Unpin Board", "test");
        pinTo("Volumetric", "Unpin Board");
        goToBoard("Unpin Board");
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Volumetric") < 0);
        
        removeBoard("Unpin Board");
    }
    
    @Test
    public void iHaveNoBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        String cdeName = "Specimen Array";

        goHome();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();
        Assert.assertTrue(textPresent("Create a board now"));
        findElement(By.id("cancelSelect")).click();
    }
    
    @Test
    public void editBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        createBoard("Edit Board", "Test");
        findElement(By.linkText("My Boards")).click();
        String mod = findElement(By.id("dd_mod")).getText();
        findElement(By.id("name_edit_0")).click();
        findElement(By.id("name_input_0")).sendKeys(" -- Name Edited");
        findElement(By.id("name_confirm_0")).click();

        Assert.assertTrue(textPresent("Saved"));

        findElement(By.id("desc_edit_0")).click();
        findElement(By.id("desc_input_0")).sendKeys(" -- Desc Edited");
        findElement(By.id("desc_confirm_0")).click();
        
        goHome();
        findElement(By.linkText("My Boards")).click();
        Assert.assertTrue(textPresent("-- Name Edited"));
        Assert.assertTrue(textPresent("-- Desc Edited"));
        
        Assert.assertNotEquals(mod + " --- " + findElement(By.id("dd_mod")).getText(), mod, findElement(By.id("dd_mod")).getText());
        
        removeBoard("Edit Board -- Name Edited");
    }
    
    @Test
    public void searchBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        String pubBlood = "Public Blood Board";
        String privBlood = "Private Blood Board";
        String pubSmoking = "Public Smoking Board";
        
        createBoard(pubBlood, "");
        createBoard(privBlood, "");
        createBoard(pubSmoking, "");
        
        makePublic(pubBlood);
        makePublic(pubSmoking);
        
        findElement(By.linkText("Boards")).click();
        findElement(By.name("search")).sendKeys("Blood");
        findElement(By.id("search.submit")).click();
        
        Assert.assertTrue(textPresent(pubBlood));

        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Smoking") < 0);
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Private") < 0);
        
        removeBoard(pubBlood);
        removeBoard(privBlood);
        removeBoard(pubSmoking);
        
    }

    @Test
    public void cdeBoards() {
        mustBeLoggedInAs(boardUser, boardPassword);
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
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(board2) < 0);

        makePublic(board2);

        goToCdeByName("Biomarker Outcome");
        findElement(By.xpath("//li[@heading='Boards']/a")).click();
        
        Assert.assertTrue(textPresent(board1));
        Assert.assertTrue(textPresent(board2));
        
        removeBoard(board1);
        removeBoard(board2);
    }  
}
