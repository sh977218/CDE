package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ResourcesPage extends NlmCdeBaseTest {

    @Test
    public void resourcesPage() {
        String resourceText = "This resources page is under construction";
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToResources();
        // wait for ckeditor <script> to resolve.
        hangon(2);
        clickElement(By.cssSelector("mat-icon[title='Edit']"));
        textPresent("Rich Text");
        clickElement(By.cssSelector(".cke_button__source"));
        findElement(By.cssSelector("textarea.cke_source")).sendKeys(resourceText);
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("\n<p>&lt;rss-feed&gt;" +
                "https://www.feedforall.com/sample.xml" + "&lt;/rss-feed&gt;</p>\n");

        // one with no URL
        findElement(By.cssSelector("textarea.cke_source")).sendKeys("\n<p>&lt;rss-feed&gt;&lt;/rss-feed&gt;</p>\n");

        clickElement(By.cssSelector(".cke_button__source"));
        clickElement(By.xpath("//mat-icon[. = 'check']"));
        checkAlert("Saved");
        textPresent(resourceText);
        clickElement(By.id("resourcesLink"));
        textPresent(resourceText);
        textPresent("RSS Feeds Result:");

        // again for coverage of rss cachere
        goHome();
        clickElement(By.id("resourcesLink"));
        textPresent(resourceText);
        textPresent("RSS Feeds Result");

    }

}
