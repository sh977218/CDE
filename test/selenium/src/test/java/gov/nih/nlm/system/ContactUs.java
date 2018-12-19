package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ContactUs extends NlmCdeBaseTest {

    @Test
    public void contactUs() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Site Management"));
        clickElement(By.xpath("/div[. = 'Articles']"));

        clickElement(By.cssSelector("mat-select"));
        selectMatSelectDropdownByText("contactUs");

        clickElement(By.xpath("//mat-icon[. = 'edit']"));
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
        clickElement(By.xpath("//mat-icon[. = 'check']"));
        checkAlert("Saved");
        logout();
        clickElement(By.id("helpLink"));
        clickElement(By.id("contactUsLink"));
        textPresent("Sample bullet");
    }

}
