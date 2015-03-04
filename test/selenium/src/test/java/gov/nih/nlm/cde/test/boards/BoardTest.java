package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;

public class BoardTest extends NlmCdeBaseTest {
    
    protected void makePublic(String boardName) {
        makePublic(boardName, "Saved");
    }
    
    protected void makePublic(String boardName, String response) {
        gotoMyBoards();
        textPresent(boardName);
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("privateIcon_" + i)).click();
                findElement(By.id("confirmChangeStatus_" + i)).click();
                textPresent(response);
                closeAlert();
                hangon(2);
                return;
            } 
        }
        Assert.assertTrue(false);
    }
    
    protected void gotoMyBoards() {
        findElement(By.linkText("Boards")).click();
        findElement(By.linkText("My Boards")).click();
        hangon(2);
    }
    
    protected void gotoPublicBoards() {
        findElement(By.linkText("Boards")).click();
        findElement(By.linkText("Public Boards")).click();    
    }     
    
    protected void createBoard(String name, String description) {
        createBoard(name, description, "Board created.");
    }
  
    protected void createBoard(String name, String description, String response) {
        gotoMyBoards();
        findElement(By.id("addBoard")).click();
        findElement(By.name("name")).sendKeys(name);
        findElement(By.name("description")).sendKeys(description);
        findElement(By.id("createBoard")).click();
        textPresent(response);
        closeAlert();
        hangon(1);
    }
    
    protected void removeBoard(String boardName) {
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("removeBoard-" + i)).click();
                findElement(By.id("confirmRemove-" + i)).click();
                textNotPresent(boardName);
                return;
            }
        }
    }
    
    protected void pinTo(String cdeName, String boardName) {
        goToCdeSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        findElement(By.linkText(boardName)).click();
        Assert.assertTrue(textPresent("Added to Board")); 
        modalGone();         
        closeAlert();
    }
    
    protected void goToBoard(String boardName) {
        gotoMyBoards();
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
                findElement(By.id("view_" + i)).click();
                return;
            }
        }
    }
    

}
