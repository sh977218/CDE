package gov.nih.nlm.cde.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class CommentTest extends CommonTest {
    
    public void gotoComments(){
        findElement(By.linkText("Discussions")).click();
    }
    
    public void addComment(String text){
        gotoComments();
        findElement(By.name("commentTextArea")).sendKeys(text);
        hangon(1);
        findElement(By.name("postComment")).click();
        Assert.assertTrue(textPresent("Comment added"));    
    }
    
    public void comments(String eltName) {
        mustBeLoggedInAs(test_username, test_password);
        goToEltByName(eltName);
        addComment("My First Comment!");
        Assert.assertTrue(textPresent("testuser"));
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("commentTextArea")).sendKeys("another comment");
        findElement(By.name("postComment")).click();
        textPresent("Comment added");
        // this effectively waits for the angular repeat to get reload and avoids stale elt reference.
        findElement(By.id("removeComment-1"));
        findElement(By.id("removeComment-0")).click();
        Assert.assertTrue(textPresent("Comment removed"));
        Assert.assertTrue(!driver.findElement(By.cssSelector("BODY")).getText().contains("My First Comment!"));
    }

    public void orgAdminCanRemoveComment(String eltName, String status) {        
        mustBeLoggedInAs(test_username, test_password);
        String commentText = "Inappropriate Comment";
        goToEltByName(eltName, status);

        addComment(commentText);

        logout();
        loginAs(cabigAdmin_username, password);
        goToEltByName(eltName, status);
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

    public void siteAdminCanRemoveComment(String eltName, String status) {        
        mustBeLoggedInAs(test_username, test_password);
        String commentText = "Another Inappropriate Comment";
        goToEltByName(eltName, status);
        addComment(commentText);
        logout();
        loginAs(nlm_username, nlm_password);
        goToEltByName(eltName, status);
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
    
    public void approvingComments(String eltName, String status) {
        String commentText = "Very Innocent Comment";
        String censoredText = "pending approval";
        mustBeLoggedInAs(anonymousCommentUser_username, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        hangon(2);
        addComment(commentText);
        textNotPresent(commentText);
        textPresent(censoredText);        
        logout();
        goToEltByName(eltName, status);
        gotoComments();
        textNotPresent(commentText);
        textPresent(censoredText);      
        
        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        gotoInbox();
        textPresent("Comment Approval");
        findElement(By.cssSelector(".accordion-toggle")).click();        

        String preClass = "";
        try {
            textPresent(eltName);
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            findElement(By.cssSelector(preClass+".accordion-toggle")).click();
            textPresent(commentText);
        }
        
        findElement(By.cssSelector(preClass+".linkToElt")).click();
        switchTab(1);
        textPresent(eltName);
        switchTabAndClose(0);        
        
        findElement(By.cssSelector(".authorizeUser")).click();     
        textPresent("Role added");        

        findElement(By.cssSelector(preClass+".approveComment")).click();
        textPresent("Comment approved");  

        
        logout();
        goToEltByName(eltName, status);
        gotoComments();
        textNotPresent(censoredText);
        textPresent(commentText);
        
        mustBeLoggedInAs(anonymousCommentUser_username, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        hangon(2);
        addComment("OK comment.");
        textNotPresent(censoredText);
        textPresent("OK comment.");        
        
    }
    
}
