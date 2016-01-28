package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class CommentTest extends CommonTest {

    public void addComment(String text) {
        clickElement(By.id("discussions_tab"));
        findElement(By.name("commentTextArea")).sendKeys(text);
        hangon(2);
        clickElement(By.name("postComment"));
        textPresent("Comment added");
    }

    public void comments(String eltName) {
        mustBeLoggedInAs(test_username, test_password);
        goToEltByName(eltName);
        showAllTabs();
        addComment("My First Comment!");
        textPresent("testuser");
        Assert.assertTrue(textPresent("My First Comment!"));
        findElement(By.name("commentTextArea")).sendKeys("another comment");
        clickElement(By.name("postComment"));
        textPresent("Comment added");
        // this effectively waits for the angular repeat to get reload and avoids stale elt reference.
        findElement(By.id("removeComment-1"));
        clickElement(By.id("removeComment-0"));
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
        clickElement(By.id("discussions_tab"));
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                clickElement(By.id("removeComment-" + i));
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
        showAllTabs();
        addComment(commentText);
        logout();
        loginAs(nlm_username, nlm_password);
        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("discussions_tab"));
        int length = driver.findElements(By.xpath("//div[starts-with(@id, 'commentText')]")).size();
        for (int i = 0; i < length; i++) {
            if (commentText.equals(findElement(By.id("commentText-" + i)).getText())) {
                clickElement(By.id("removeComment-" + i));
                i = length;
                Assert.assertTrue(textPresent("Comment removed"));
                hangon(1);
                Assert.assertTrue(textPresent(commentText));
            }
        }
    }

    public void approvingComments(String eltName, String status, String user) {
        String commentText = "Very Innocent Comment";
        String censoredText = "pending approval";
        mustBeLoggedInAs(user, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        showAllTabs();
        addComment(commentText);
        textNotPresent(commentText);
        textPresent(censoredText);
        logout();
        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("discussions_tab"));
        textNotPresent(commentText);
        textPresent(censoredText);

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment Approval");
        clickElement(By.cssSelector(".accordion-toggle"));

        String preClass = "";
        try {
            textPresent(eltName);
        } catch (Exception e) {
            preClass = "uib-accordion:nth-child(2) ";
            clickElement(By.cssSelector(preClass + ".accordion-toggle"));
            textPresent(commentText);
        }

        clickElement(By.cssSelector(preClass + ".linkToElt"));
        switchTab(1);
        textPresent(eltName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(preClass + ".authorizeUser"));
        clickElement(By.id("authorizeUserOK"));

        textPresent("Role added");
        closeAlert();
        modalGone();

        clickElement(By.cssSelector(preClass + ".approveComment"));
        textPresent("Comment approved");


        logout();
        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("discussions_tab"));
        textNotPresent(censoredText);
        textPresent(commentText);

        mustBeLoggedInAs(user, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        showAllTabs();
        addComment("OK comment.");
        textNotPresent(censoredText);
        textPresent("OK comment.");

        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, status);
        showAllTabs();
        addComment("Curator's comment.");
        textNotPresent(censoredText);
        textPresent("Curator's comment.");

    }

    public void declineComment(String eltName, String status, String user) {
        String commentText = "Bad Comment";
        String censoredText = "pending approval";
        mustBeLoggedInAs(user, anonymousCommentUser_password);
        goToEltByName(eltName, status);
        showAllTabs();
        addComment(commentText);
        textNotPresent(commentText);
        textPresent(censoredText);
        logout();

        mustBeLoggedInAs(commentEditor_username, commentEditor_password);
        hangon(1);
        clickElement(By.id("incomingMessage"));

        textPresent("Comment Approval");
        clickElement(By.cssSelector(".accordion-toggle"));

        String preClass = "";
        try {
            textPresent(eltName);
        } catch (Exception e) {
            preClass = "accordion:nth-child(2) ";
            clickElement(By.cssSelector(preClass + ".accordion-toggle"));
            textPresent(commentText);
        }

        clickElement(By.cssSelector(preClass + ".linkToElt"));
        switchTab(1);
        textPresent(eltName);
        switchTabAndClose(0);

        clickElement(By.cssSelector(preClass + ".declineComment"));
        textPresent("Comment declined");

        logout();
        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("discussions_tab"));
        textNotPresent(censoredText);
        textNotPresent(commentText);

    }

}
