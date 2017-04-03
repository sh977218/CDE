package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeScoreValidationErrorTest extends BaseFormTest {
    @Test
    public void cdeScoreValidationError() {
        mustBeLoggedInAs(ninds_username, password);
        emptyQuickBoardByModule("cde");
        goToCdeByName("DRS Total Score");

        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("There are no CDEs in your Quick Board. Add some before you can create a rule.");
        Assert.assertFalse(findElement(By.id("createDerivationRule")).isEnabled());
        clickElement(By.id("cancelCreate"));
    }

}
