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
        Assert.assertTrue(textPresent(boardName));
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("privateIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("publicIcon_" + i)));
                hangon(2);
                return;
            } 
        }
        Assert.assertTrue(false);
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
        Assert.assertTrue(textNotPresent("Not a very useful"));

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
                Assert.assertTrue(textNotPresent(boardName));
                return;
            }
        }
    }
    
    @Test
    public void removeBoard() {
        mustBeLoggedInAs(boardUser, boardPassword);
        createBoard("Remove me board", "Not a very useful board");
        removeBoard("Remove me board");
        goToSearch();
        findElement(By.linkText("My Boards")).click();
        Assert.assertTrue(textNotPresent("Not a very useful"));
    }
    
    private void pinTo(String cdeName, String boardName) {
        goToSearch();
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
        goToSearch();
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
        goToSearch();
        createBoard("Blood Board", "Collect blood related cdes here");
        createBoard("Smoking Board", "Collect Smoking CDEs here");
        
        findElement(By.linkText("My Boards")).click();           
        Assert.assertTrue(textPresent("Collect blood"));
        Assert.assertTrue(textPresent("Smoking CDEs"));

        pinTo("Laboratory Procedure Blood Urea Nitrogen", "Blood Board");
        pinTo("Umbilical Cord Blood", "Blood Board");
        pinTo("Smoking History Ind", "Smoking Board");
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
        goToSearch();
        String cdeName = "Specimen Array";
        String boardName = "Double Pin Board";
        
        createBoard(boardName, "test");
        pinTo(cdeName, boardName);
        
        goToSearch();
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
        goToSearch();
        createBoard("Unpin Board", "test");
        pinTo("Volumetric", "Unpin Board");
        goToBoard("Unpin Board");
        Assert.assertTrue(textPresent("Volumetric"));
        findElement(By.id("unpin_0")).click();
        goToBoard("Unpin Board");
        Assert.assertTrue(textNotPresent("Volumetric"));
        
        removeBoard("Unpin Board");
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
    }
    
    @Test
    public void editBoard() {
        mustBeLoggedInAs("boarduserEdit", boardPassword);
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
        
        goToSearch();
        findElement(By.linkText("My Boards")).click();
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
        
        findElement(By.linkText("Boards")).click();
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
        findElement(By.linkText("My Boards")).click();
        findElement(By.linkText("View Board")).click();
        findElement(By.linkText("30")).click();
        Assert.assertTrue(textPresent("Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number"));
        Assert.assertTrue(textPresent("Volumetric Measurement Left Limb Testing Result"));
        Assert.assertTrue(textPresent("Walking difficulty age need intermittent support not applicable indicator"));
        Assert.assertTrue(textPresent("Water reference data acquisition data acquisition time"));
    }    
}
