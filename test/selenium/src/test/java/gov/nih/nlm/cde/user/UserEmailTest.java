package gov.nih.nlm.cde.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UserEmailTest extends NlmCdeBaseTest {
    @Test
    public void userEmail() {
        mustBeLoggedInAs(test_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textPresent("test@example.com");
        Assert.assertEquals(findElement(By.xpath("//*[@id='user_email']/span/span/span")).getText(), "test@example.com");
        clickElement(By.xpath("//*[@id='emailEdit']//mat-icon[. = 'edit']"));
        findElement(By.xpath("//*[@id='emailEdit']//input")).clear();
        findElement(By.xpath("//*[@id='emailEdit']//input")).sendKeys("me@");
        Assert.assertFalse(findElement(By.xpath("//cde-inline-edit[@id='emailEdit']//button[contains(text(),'Confirm')]")).isEnabled());
        findElement(By.xpath("//cde-inline-edit[@id='emailEdit']//input")).sendKeys("me.com");
        Assert.assertTrue(findElement(By.xpath("//cde-inline-edit[@id='emailEdit']//button[contains(text(),'Confirm')]")).isEnabled());
        clickElement(By.xpath("//cde-inline-edit[@id='emailEdit']//button[contains(text(),'Confirm')]"));
        textPresent("Saved");
    }
}
