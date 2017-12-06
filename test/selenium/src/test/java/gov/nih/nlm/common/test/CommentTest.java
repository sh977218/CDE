package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;

public abstract class CommentTest extends CommonTest {

    protected void addComment(String text) {
        clickElement(By.id("discussBtn"));
        findElement(By.name("commentTextArea")).sendKeys(text);
        hangon(2);
        clickElement(By.id("postComment"));
        textPresent(text);
    }

    private void addCommentNeedApproval(String text) {
        clickElement(By.id("discussBtn"));
        findElement(By.name("commentTextArea")).sendKeys(text);
        hangon(2);
        clickElement(By.id("postComment"));
        textNotPresent(text);
        textPresent("This comment is pending approval");
    }

    public void showLongComments(String eltName) {
        mustBeLoggedInAs(test_username, password);
        goToEltByName(eltName);
        clickElement(By.id("discussBtn"));
        clickElement(By.linkText("Show all 10 replies"));
        textNotPresent("Show all 10 replies");
        for (int k = 1; k <= 10; k++) textPresent("Reply to very long comment " + k);
    }

    public void comments(String eltName) {
        mustBeLoggedInAs(test_username, password);
        goToEltByName(eltName);

        addComment("My First Comment about Status!");
        textPresent("My First Comment about Status!");
        Assert.assertEquals(true, findElement(By.id("comment_0")).getAttribute("class").contains("currentTabComment"));

        goToNaming();
        findElement(By.name("commentTextArea")).sendKeys("another comment about Naming");
        clickElement(By.name("postComment"));

        findElement(By.xpath("//*[@id='comment_0' and not(contains(@class, 'currentTabComment'))]"));
        findElement(By.xpath("//*[@id='comment_1' and contains(@class, 'currentTabComment')]"));

        clickElement(By.id("replyTextarea_0"));
        findElement(By.id("replyTextarea_0")).sendKeys("Reply to First comment about Status");
        scrollToViewById("replyBtn_0");
        clickElement(By.id("replyBtn_0"));

        hangon(1);
        clickElement(By.id("replyTextarea_0"));
        findElement(By.id("replyTextarea_0")).sendKeys("Second reply to First comment about Status");
        hangon(1);
        scrollToViewById("replyBtn_0");
        clickElement(By.id("replyBtn_0"));

        hangon(1);
        clickElement(By.id("replyTextarea_1"));
        hangon(1);
        findElement(By.id("replyTextarea_1")).sendKeys("Reply to another comment about Naming");
        hangon(1);
        scrollToViewById("replyBtn_1");
        clickElement(By.id("replyBtn_1"));
        textPresent("Reply to another comment about Naming", By.id("replyText-1-0"));

        scrollToTop();
        clickElement(By.id("resolveReply-0-0"));
        textPresent("Reply to First comment", By.cssSelector(".strike"));

        clickElement(By.id("reopenReply-0-0"));

        scrollDownBy(500);
        clickElement(By.id("resolveReply-1-0"));
        textPresent("Reply to another comment", By.cssSelector(".strike"));

        clickElement(By.id("removeReply-0-1"));

        textPresent("My First Comment about Status!");
        textPresent("Reply to First comment about Status");
        textNotPresent("Second reply to First comment about Status");
        textPresent("another comment about Naming");
        textPresent("Reply to another comment about Naming");
    }

    public void orgAdminCanRemoveComment(String eltName, String status) {
        mustBeLoggedInAs(test_username, password);
        String commentText = "Inappropriate Comment";
        goToEltByName(eltName, status);
        addComment(commentText);

        mustBeLoggedInAs(cabigAdmin_username, password);
        goToEltByName(eltName, status);
        clickElement(By.id("discussBtn"));
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                clickElement(By.id("removeComment-" + i));
                i = length;
                textNotPresent(commentText);
            }
        }
    }

    public void siteAdminCanRemoveComment(String eltName, String status) {
        mustBeLoggedInAs(test_username, password);
        String commentText = "Another Inappropriate Comment";
        goToEltByName(eltName, status);
        addComment(commentText);
        logout();
        loginAs(nlm_username, nlm_password);
        goToEltByName(eltName, status);
        clickElement(By.id("discussBtn"));
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                clickElement(By.id("removeComment-" + i));
                i = length;
                textNotPresent(commentText);
            }
        }
    }

    public void approveComments(String eltName, String status, String user) {
        int randomNumber = (int) (Math.random() * 10000);
        String commentText = "Very Innocent Comment " + randomNumber;
        String censoredText = "This comment is pending approval";
        mustBeLoggedInAs(user, password);
        goToEltByName(eltName, status);
        addCommentNeedApproval(commentText);
        logout();
        goToEltByName(eltName, status);
        clickElement(By.id("discussBtn"));
        textNotPresent(commentText);
        textPresent(censoredText);

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment approval");

        clickElement(By.partialLinkText("Comment approval | " + user + " | " + commentText));
        clickElement(By.xpath("//div[@class='card']//a[contains(., '" + eltName + "')]"));

        switchTab(1);
        textPresent(eltName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(".card .authorizeUser"));
        clickElement(By.id("authorizeUserOK"));

        textPresent("Role added");
        closeAlert();
        modalGone();

        clickElement(By.cssSelector(".card .approveComment"));
        textPresent("Approved");

        logout();
        goToEltByName(eltName, status);

        clickElement(By.id("discussBtn"));
        textNotPresent(censoredText);
        textPresent(commentText);

        doLogin(user, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        addComment("OK comment.");
        textNotPresent(censoredText);
        textPresent("OK comment.");

        logout();
        doLogin(ninds_username, password);
        goToEltByName(eltName, status);
        addComment("Curator's comment.");
        textNotPresent(censoredText);
        textPresent("Curator's comment.");

    }

    public void declineComment(String eltName, String status, String user) {
        String commentText = "Bad Comment";
        String censoredText = "This comment is pending approval.";
        mustBeLoggedInAs(user, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        addCommentNeedApproval(commentText);
        logout();

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        hangon(1);
        clickElement(By.id("incomingMessage"));

        clickElement(By.partialLinkText("Comment approval | " + user + " | " + commentText));

        clickElement(By.cssSelector(".card .linkToElt"));
        switchTab(1);
        textPresent(eltName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(".card .declineComment"));

        logout();
        goToEltByName(eltName, status);
        clickElement(By.id("discussBtn"));
        textNotPresent(censoredText);
        textNotPresent(commentText);
    }

    public void approveReply(String eltName) {
        int randomNumber = (int) (Math.random() * 10000);
        String commentText = "Top Level Comment " + randomNumber;
        String replyText = "Very Innocent Reply " + randomNumber;
        mustBeLoggedInAs(reguser_username, anonymousCommentUser_password);
        goToEltByName(eltName);
        addCommentNeedApproval(commentText);

        clickElement(By.id("replyTextarea_0"));
        hangon(1);
        findElement(By.id("replyTextarea_0")).sendKeys(replyText);
        hangon(1);
        clickElement(By.id("replyBtn_0"));
        textNotPresent(replyText);

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        clickElement(By.id("incomingMessage"));

        clickElement(By.partialLinkText("Comment approval | reguser | " + replyText));
        clickElement(By.cssSelector(".card .approveComment"));

        textPresent("Message moved");
        textPresent("Approved");

        mustBeLoggedOut();
        goToEltByName(eltName);
        clickElement(By.id("discussBtn"));
        textPresent(replyText);
    }

    public void reviewerCanComment(String eltName) {
        String commentText = "Comment made by reviewer";
        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        goToEltByName(eltName);
        addComment(commentText);
        mustBeLoggedOut();
        goToEltByName(eltName);
        clickElement(By.id("discussBtn"));
        textPresent(commentText);
    }

}
