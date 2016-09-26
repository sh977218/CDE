package gov.nih.nlm.system;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UserTest extends NlmCdeBaseTest {

    @Test
    public void wrongLogin() {
        mustBeLoggedOut();
        goToCdeSearch();
        try {
            clickElement(By.linkText("Log In"));
        } catch (TimeoutException e) {
            logout();
            clickElement(By.linkText("Log In"));
        }

        enterUsernamePasswordSubmit("bad-username", "bad-password", "Failed to log in.");
        enterUsernamePasswordSubmit(ctepCurator_username, password, "ctepCurator");
    }

    @Test
    public void curatorProfile() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        clickElement(By.id("username_link"));
        clickElement(By.linkText("Profile"));
        Assert.assertEquals("cabigAdmin", findElement(By.id("username")).getText());
        Assert.assertEquals("1,024.00 MB", findElement(By.id("quota")).getText());
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        Assert.assertEquals("caBIG", findElement(By.id("adminFor")).getText());
    }

    @Test
    public void regUserCannotCreate() {
        mustBeLoggedInAs(reguser_username, password);
        findElement(By.id("username_link"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
    }

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

    @Test
    public void testLongUsername() {
        mustBeLoggedInAs("hiIamLongerThanSeventeenCharacters", password);
    }

}
