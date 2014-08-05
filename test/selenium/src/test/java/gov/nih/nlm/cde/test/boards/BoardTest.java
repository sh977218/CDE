package gov.nih.nlm.cde.test.boards;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public class BoardTest extends NlmCdeBaseTest {
    
    protected static final String boardUser = "boarduser";
    protected static final String boardPassword = "pass";
    
    protected void makePublic(String boardName) {
        findElement(By.linkText("My Boards")).click();
        Assert.assertTrue(textPresent(boardName));
        int length = driver.findElements(By.linkText("View Board")).size();
        for (int i = 0; i < length; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if (boardName.equals(name)) {
//                scrollTo("500");
//                findElement(By.id("privateIcon_" + i)).click();
                clickElement(findElement(By.id("privateIcon_" + i)));
//                findElement(By.id("confirmChangeStatus_" + i)).click();
                clickElement(findElement(By.id("confirmChangeStatus_" + i)));
//                hangon(1);
//                wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[@id='publicIcon_" + i + "']")));
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("publicIcon_" + i)));
                hangon(2);
                return;
            } 
        }
        Assert.assertTrue(false);
    }
  
    protected void createBoard(String name, String description) {
        findElement(By.linkText("My Boards")).click();
        scrollTo("500");
        findElement(By.id("addBoard")).click();
//        clickElement(findElement(By.id("addBoard")));
        findElement(By.name("name")).sendKeys(name);
        findElement(By.name("description")).sendKeys(description);
        findElement(By.id("createBoard")).click();
        modalGone();
    }
    
    protected void removeBoard(String boardName) {
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
    
    protected void pinTo(String cdeName, String boardName) {
        goToSearch();
        openCdeInList(cdeName);
        findElement(By.id("pin_0")).click();
        modalHere();        
        findElement(By.linkText(boardName)).click();
        modalGone();
        Assert.assertTrue(textPresent("Added to Board"));    
    }
    
    protected void goToBoard(String boardName) {
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
    

}
