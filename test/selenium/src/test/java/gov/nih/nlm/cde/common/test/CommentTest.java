package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class CommentTest extends CommonTest {
    
    public void comments(String eltName) {
        mustBeLoggedInAs(test_username, test_password);
        goToEltByName(eltName);
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys("My First Comment!");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("comment")).sendKeys("another comment");
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        scrollTo( "2000" );
        findElement(By.id("removeComment-0")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("My First Comment!"));
    }

    public void orgAdminCanRemoveComment(String eltName) {        
        mustBeLoggedInAs(test_username, test_password);
        String commentText = "Inappropriate Comment";
        goToEltByName(eltName);
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys(commentText);
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        logout();
        loginAs(cabigAdmin_username, cabigAdmin_password);
        goToEltByName(eltName);
        findElement(By.linkText("Discussions")).click();
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                findElement(By.id("removeComment-" + i)).click();
                i = length;
                Assert.assertTrue(textPresent("Comment removed"));
                hangon(1);
                Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains(commentText));
            }
        }
    }

    public void siteAdminCanRemoveComment(String eltName) {        
        mustBeLoggedInAs(test_username, test_password);
        String commentText = "Another Inappropriate Comment";
        goToEltByName(eltName);
        findElement(By.linkText("Discussions")).click();
        findElement(By.name("comment")).sendKeys(commentText);
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));
        logout();
        loginAs(nlm_username, nlm_password);
        goToEltByName(eltName);
        findElement(By.linkText("Discussions")).click();
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                findElement(By.id("removeComment-" + i)).click();
                i = length;
                Assert.assertTrue(textPresent("Comment removed"));
                hangon(1);
                Assert.assertTrue(driver.findElement(By.cssSelector("BODY")).getText().indexOf(commentText) < 0);
            }
        }
    }
    
}