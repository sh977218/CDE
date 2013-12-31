/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 *
 * @author ludetc
 */
public class BoardTest extends NlmCdeBaseTest {
    
    private static final String boardUser = "boarduser";
    private static final String boardPassword = "pass";
    
    @BeforeClass
    public void login() {
        loginAs(boardUser, boardPassword);
    }

    @AfterClass
    public void logout() {
        logout();
    }

    
    private void createBoard(String name, String description) {
        findElement(By.linkText("My Boards")).click();
        findElement(By.id("createBoard")).click();
        findElement(By.name("name")).sendKeys(name);
        findElement(By.name("description")).sendKeys(description);
        findElement(By.id("createBoard")).click();        
    }
    
    @Test
    public void createBoards() {
        createBoard("Blood Board", "Collect blood related cdes here");
        createBoard("Remove me board", "Not a very useful board");
        createBoard("Smoking Board", "Collect Smoking CDEs here");
        
        findElement(By.linkText("My Boards")).click();           
        Assert.assertTrue(textPresent("Collect blood"));
        Assert.assertTrue(textPresent("Remove me"));
        Assert.assertTrue(textPresent("Smoking CDEs"));
    }
    
    @Test (dependsOnMethods = {"createBoards"})
    public void removeBoard() {
        findElement(By.linkText("My Boards")).click();
        for (int i = 0; i < 3; i++) {
            String name = findElement(By.id("dd_name_" + i)).getText();
            if ("Remove me board".equals(name)) {
                findElement(By.id("removeBoard-" + i)).click();
                findElement(By.id("confirmRemove-" + i)).click();
            }
        }
        driver.get(baseUrl + "/");
        findElement(By.linkText("My Boards")).click();
        Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf("Not a very useful") < 0);
    }
    
    private void pinTo(String cdeName, String boardName) {
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys(cdeName);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(cdeName));
        findElement(By.id("pin_0")).click();
        findElement(By.linkText(boardName)).click();
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
    
    @Test (dependsOnMethods = {"createBoards"})
    public void pin() {
        pinTo("Companion Blood", "Blood Board");
        pinTo("Umbilical Cord Blood", "Blood Board");
        pinTo("Smoking History", "Smoking Board");
        pinTo("Smoking Cessation", "Smoking Board");
        
        goToBoard("Smoking Board");
        Assert.assertEquals(driver.findElements(By.linkText("View Full Detail")).size(), 2);
        Assert.assertTrue(textPresent("Smoking History"));
        Assert.assertTrue(textPresent("Smoking Cessation"));

        goToBoard("Blood Board");
        Assert.assertEquals(driver.findElements(By.linkText("View Full Detail")).size(), 2);
        Assert.assertTrue(textPresent("Companion Blood"));
        Assert.assertTrue(textPresent("Umbilical Cord Blood"));
    }

    @Test (dependsOnMethods = {"createBoards"})
    public void noDoublePin() {
        createBoard("Double Pin Test", "test");
        pinTo("Specimen Array", "Double Pin Test");
        
        driver.get(baseUrl + "/");
        findElement(By.name("ftsearch")).sendKeys(cdeName);
        findElement(By.id("search.submit")).click();
        findElement(By.partialLinkText(cdeName));
        findElement(By.id("pin_0")).click();
        findElement(By.linkText(boardName)).click();
        Assert.assertTrue(textPresent("Already added"));
        
        goToBoard("Double Pin Test");
        Assert.assertEquals(driver.findElements(By.linkText("View Full Detail")).size(), 1);
    }
    
    @Test (dependsOnMethods = {"createBoards"})
    public void unpin() {
        createBoard("Unpin Board", "test");
        pinTo("Volumetric", "Unpin Board");
    }

    
}
