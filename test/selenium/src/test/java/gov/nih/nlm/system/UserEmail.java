package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UserEmail extends NlmCdeBaseTest {
    @Test
    public void userEmail() {
        mustBeLoggedInAs(test_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        textPresent("test@example.com");
        Assert.assertEquals(findElement(By.id("user_email")).getText(), "test@example.com");
        clickElement(By.xpath("//div[@id='emailEdit']//i"));
        findElement(By.xpath("//div[@id='emailEdit']//input")).clear();
        findElement(By.xpath("//div[@id='emailEdit']//input")).sendKeys("me@");
        Assert.assertFalse(findElement(By.xpath("//div[@id='emailEdit']//button[contains(text(),'Confirm')]")).isEnabled());
        findElement(By.xpath("//div[@id='emailEdit']//input")).sendKeys("me.com");
        Assert.assertTrue(findElement(By.xpath("//div[@id='emailEdit']//button[contains(text(),'Confirm')]")).isEnabled());
        clickElement(By.xpath("//div[@id='emailEdit']//button[contains(text(),'Confirm')]"));
        textPresent("Saved");
    }
}
