package gov.nih.nlm.cde.test.boards;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class BoardManagementTest extends BoardTest {
    
    @Test
    public void boardPublisher() {
        mustBeLoggedInAs("boardPublisherTest", password);
        createBoard("IsItPublic", "A board that we try to make public");
        
        // test for failure
        
        mustBeLoggedInAs(nlm_username, nlm_password);
        findElement(By.id("username_link")).click();
        findElement(By.linkText("Site Management")).click();
        findElement(By.linkText("Users")).click();
        
        findElement(By.name("searchUsers")).sendKeys("boardPublisherTest");
        findElement(By.id("searchUsersSubmit")).click();
        findElement(By.xpath("//div[@id='user_roles_0']//input")).sendKeys("boardp");
        findElement(By.xpath("//div[@id='user_roles_0']//li/div/span")).click();
        textPresent("Roles saved");
        closeAlert();
        
        mustBeLoggedInAs("boardPublisherTest", password);
        gotoMyBoards();
        
        //test for success

        
    }
    
    @Test
    public void publicVsPrivateBoards() {
        mustBeLoggedInAs(boardUser, password);
        String boardName = "Public Board";
        String boardDef = "This board will be public";
        
        createBoard(boardName, "This board will be public");
        pinTo("Heart MUGA", boardName);
        // by default, board is private.

        goToBoard(boardName);
        // I can view my own board.
        textPresent("MUGA");
        String url = driver.getCurrentUrl();
        String boardId = url.substring(url.lastIndexOf("/") + 1);
         
        logout();
        driver.get(baseUrl + "/#/board/" + boardId);
        // not logged in, I can't see
        textPresent("Board not found");
        closeAlert();
        textNotPresent(boardDef);
        
        loginAs(ctepCurator_username, password);
        driver.get(baseUrl + "/#/board/" + boardId);
        // logged in as someone else, I can't see
        textPresent("Board not found");
        closeAlert();
        textNotPresent(boardDef);
        
        logout();
        
        loginAs(boardUser, password);
        makePublic(boardName);
        
        logout();
        
        driver.get(baseUrl + "/#/board/" + boardId);
        // Now I can see;
        textPresent("MUGA");

        loginAs(boardUser, password);
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("publicIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("privateIcon_" + i)));
                i = length;
            }
        }
        
        logout();
        
        driver.get(baseUrl + "/#/board/" + boardId);
        // private again, I can't see
        Assert.assertTrue(textNotPresent("Not a very useful"));

        loginAs(boardUser, password);
        
        removeBoard(boardName);
    }
        
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
        modalHere();
        Assert.assertTrue(textPresent("Create a board now"));
        findElement(By.id("cancelSelect")).click();
        modalGone();
    }
    
       
}
