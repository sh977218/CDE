package gov.nih.nlm.user;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UserTest extends NlmCdeBaseTest {

    @Test
    public void curatorProfile() {
        mustBeLoggedInAs(cabigEditor_username, password);
        goToProfile();
        textPresent("cabigEditor", By.id("username"));
        textPresent("1,024.00", By.id("quota"));
        Assert.assertEquals("", findElement(By.id("curatorFor")).getText());
        textPresent("caBIG", By.id("editorFor"));
    }

    @Test
    public void regUserCannotCreate() {
        mustBeLoggedInAs(reguser_username, password);
        findElement(By.id("username_link"));
        shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("createEltLink")));
    }

    @Test
    public void testLongUsername() {
        mustBeLoggedInAs("hiIamLongerThanSeventeenCharacters", password);
    }

}
