package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class YoutubeVideo extends NlmCdeBaseTest {

    @Test
    public void youtubeVideo() {
        driver.get(baseUrl + "/videos");
        goHome();
        goToVideos();
        textNotPresent("404");
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToArticles();
        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("videos");
        clickElement(By.xpath("//mat-icon[normalize-space() = 'edit']"));
        hangon(2);
        clickElement(By.xpath("//button[. = 'Plain Text']"));
        hangon(2);
        findElement(By.cssSelector("textArea")).sendKeys("&lt;cde-youtube-video&gt;tBHLNhX2nK8&lt;/cde-youtube-video&gt;");
        hangon(2);
        clickElement(By.xpath("//button[text() = 'Rich Text']"));
        hangon(2);
        clickElement(By.xpath("//mat-icon[normalize-space() = 'check']"));
        checkAlert("Saved");
        logout();
        goToVideos();
        driver.get(baseUrl + "/videos");
        textNotPresent("404");
    }

}
