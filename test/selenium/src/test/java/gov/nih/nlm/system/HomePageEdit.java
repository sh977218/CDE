package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HomePageEdit extends NlmCdeBaseTest {

    @Test
    public void homePageEdit() {
        goHome();
        mustBeLoggedInAs(nlmCuratorUser_username, password);
        clickElement(By.xpath("//mat-icon[normalize-space()='edit']"));
        scrollDownBy(10000);
        findElement(By.xpath("//button[text()='Save for Later']"));
        clickElement(By.xpath("//button[contains(.,'Add Update')]"));
        findElement(By.xpath("//label[contains(.,'Title:')]/input")).sendKeys("Update here");
        clickElement(By.xpath("//button[contains(.,'Add Button')]"));
        findElement(By.xpath("//*[contains(@class,'updateButtonCard')]/*[contains(.,'Title:')]/input")).sendKeys("Click for more");
        clickElement(By.xpath("//button[contains(.,'Publish')]"));
        textPresent("Update here", By.xpath("//*[contains(@class,'updatesBox')]"));
        textPresent("Click for more", By.xpath("//*[contains(@class,'updatesBox')]"));
    }

}
