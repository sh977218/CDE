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
        textPresent("cabigAdmin", By.id("username"));
        textPresent("1,024.00", By.id("quota"));
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        textPresent("caBIG", By.id("adminFor"));
    }

    @Test
    public void regUserCannotCreate() {
        mustBeLoggedInAs(reguser_username, password);
        findElement(By.id("username_link"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.linkText("Create")));
    }

    @Test
    public void testLongUsername() {
        mustBeLoggedInAs("hiIamLongerThanSeventeenCharacters", password);
    }

}
