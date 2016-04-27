package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.cde.test.quickboard.CdeQuickBoardTest1;
import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeScoreValidationErrorTest extends BaseFormTest {
    private CdeQuickBoardTest1 qbTest = new CdeQuickBoardTest1();

    @Test
    public void cdeScoreValidationError() {
        mustBeLoggedInAs(ninds_username, password);
        qbTest.emptyQuickBoardByModule("cde");
        goToCdeByName("DRS Total Score");
        showAllTabs();
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("There are no CDEs in your Quick Board. Add some before you can create a rule.");
        Assert.assertFalse(findElement(By.id("createDerivationRule")).isEnabled());
        clickElement(By.id("cancelCreate"));
    }

}
