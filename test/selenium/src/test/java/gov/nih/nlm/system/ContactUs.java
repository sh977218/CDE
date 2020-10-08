package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ContactUs extends NlmCdeBaseTest {

    @Test
    public void contactUs() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToArticles();

        nonNativeSelect("", "Article Key", "contactUs");

        clickElement(By.xpath("//mat-icon[normalize-space() = 'edit']"));
        hangon(2);
        clickElement(By.xpath("//button[. = 'Plain Text']"));
        hangon(2);

        findElement(By.cssSelector("textArea")).sendKeys("<h3>title of contact us</h3><p>" +
                "<ul>" +
                "<li>Sample bullet</li>" +
                "</ul>");

        hangon(2);

        clickElement(By.xpath("//button[text() = 'Rich Text']"));

        hangon(2);
        clickElement(By.xpath("//mat-icon[normalize-space() = 'check']"));
        checkAlert("Saved");
        logout();
        goToContactUs();
        textPresent("Sample bullet");
    }

}
