package gov.nih.nlm.cde.article.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ArticleTest extends NlmCdeBaseTest {
    
    private void newArticle(String name) {
        driver.get(baseUrl + "#/help/bogus");
        findElement(By.id("addNewArticle")).click();
        findElement(By.name("key")).sendKeys(name);
        waitAndClick(By.id("confirmNewArticle"));
        textPresent("Saved.");
        textPresent("has no content");        
    }
    
    @Test
    public void createNew() {
        mustBeLoggedInAs(docEditor, password);
        newArticle("createNewTest");
        driver.get(baseUrl + "#/help/createNewTest");
        textPresent("has no content");
    }
    
    @Test
    public void adminCanEdit() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        driver.get(baseUrl + "#/help/testAdminCanEdit");
        textPresent("Admin can edit this.");
        findElement(By.id("editArticle")).click();
        findElement(By.xpath("//div[@contenteditable = 'true']")).sendKeys("I edited this.  ");
        findElement(By.id("saveArticle")).click();
        textPresent("Saved.");
        textPresent("I edited this.");
        driver.get(baseUrl + "#/help/testAdminCanEdit");        
        textPresent("I edited this.");
    }
    
    @Test
    public void regularUserCantEdit() {
        mustBeLoggedInAs(test_username, test_password);
        driver.get(baseUrl + "#/help/testAdminCanEdit");
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("editArticle")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("addNewArticle")));
    }
    
    @Test
    public void edits() {
        mustBeLoggedInAs(docEditor, password);
        driver.get(baseUrl + "#/help/testEdits");
        textPresent("Testing edits");
        findElement(By.id("editArticle")).click();
        findElement(By.xpath("//div[@contenteditable = 'true']")).sendKeys("adding some edits  ");
        findElement(By.id("saveArticle")).click();
        textPresent("Saved.");
        textPresent("adding some edits");
        driver.get(baseUrl + "#/help/testEdits");        
        textPresent("adding some edits");
        findElement(By.linkText("History")).click();
        Assert.assertEquals(driver.findElements(By.xpath("//table[@id = 'historyTable']//tr")).size(), 2);
    }
    
    
    
    
}
