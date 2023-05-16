package gov.nih.nlm.system;

import gov.nih.nlm.common.test.BaseAttachmentTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ResourcesPage extends BaseAttachmentTest {

    @Test
    public void resourcesPage() {
        String attachmentName = "painLocationInapr.png";
        String resourceText = "The NIH CDE Repository is consolidating CDE Resources here on the NIH CDE Repository website";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToArticles();
        selectArticleByKey("resources");
        // wait for ckeditor <script> to resolve.
        hangon(2);
        addAttachment(attachmentName);
        clickElement(By.cssSelector("mat-icon[title='Edit']"));
        textPresent("Rich Text");
        clickElement(By.cssSelector(".cke_button__source"));
        findElement(By.cssSelector("textarea.cke_source")).sendKeys(resourceText);
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("\n<p>&lt;rss-feed&gt;" +
                "https://www.nibib.nih.gov/rss" + "&lt;/rss-feed&gt;</p>\n");

        // one with no URL
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("\n<p>&lt;rss-feed&gt;&lt;/rss-feed&gt;</p>\n");

        // one with wrong format
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("\n<p>&lt;rs-feed&gt;&lt;/rs-feed&gt;</p>\n");

        clickElement(By.cssSelector(".cke_button__source"));
        clickElement(By.xpath("//mat-icon[. = 'check']"));
        checkAlert("Saved");
        clickElement(By.cssSelector(".expandTextButton"));
        textPresent(resourceText);
        goToHelp();
        clickElement(By.id("resourcesLink"));
        textPresent(resourceText);
        textPresent("Search results for:");

        // again for coverage of rss cache
        goHome();
        goToHelp();
        clickElement(By.id("resourcesLink"));
        textPresent(resourceText);
        textPresent("Search results for:");

    }

}
