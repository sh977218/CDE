package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ResourcesPage extends NlmCdeBaseTest {

    @Test
    public void resourcesPage() {
        String resourceText = "This resources page is under construction";
        mustBeLoggedInAs(nlm_username, nlm_password);
        openUserMenu();
        goToSiteManagement();
        clickElement(By.xpath("//div[. = 'Resources']"));
        hangon(1);
        clickElement(By.cssSelector("mat-icon[title='Edit']"));
        clickElement(By.cssSelector(".cke_button__source"));
        findElement(By.cssSelector("textarea.cke_source")).sendKeys(resourceText);
        clickElement(By.xpath("//mat-icon[. = 'check']"));
        checkAlert("Saved");
        hangon(1);
        clickElement(By.id("resourcesLink"));
        textPresent(resourceText);
    }

}
