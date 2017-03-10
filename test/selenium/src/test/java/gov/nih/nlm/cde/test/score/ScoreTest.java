package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ScoreTest extends NlmCdeBaseTest {

    @Test
    public void cannotScoreAsAnonymous() {
        mustBeLoggedOut();
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");

        clickElement(By.id("derivationRules_tab"));
        textNotPresent("Add Score");
    }

    @Test
    public void cannotCreateWithZeroCdes() {
        mustBeLoggedInAs(ctepCurator_username, password);
        emptyQuickBoardByModule("cde");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");

        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("There are no CDEs in your Quick Board. Add some before you can create a rule.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

    @Test
    public void cannotAddSelfToRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        goToCdeByName("Common Toxicity Criteria Adverse Event Diaphoresis Grade");
        clickElement(By.id("addToQuickBoard"));

        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("You are trying to add a CDE to itself. Please edit your Quick Board.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

    @Test
    public void cannotAddDatatypeText() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        emptyQuickBoardByModule("cde");
        goToCdeByName("Excisional Biopsy Colorectal Pathology Comment java.lang.String");
        clickElement(By.id("addToQuickBoard"));
        textPresent("Quick Board (1)");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");

        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("CDE Excisional Biopsy Colorectal Pathology Comment java.lang.String has a datatype other than 'Number' and may not be added to a score");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

}
