package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ScoreTest extends NlmCdeBaseTest {

    private CdeQuickBoardTest1 qbTest = new CdeQuickBoardTest1();

    @Test
    public void cannotCreateWithZeroCdes() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoardByModule("cde");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");
        showAllTabs();
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("There are no CDEs in your Quick Board. Add some before you can create a rule.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

    @Test
    public void cannotAddSelfToRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoardByModule("cde");
        goToCdeByName("Common Toxicity Criteria Adverse Event Diaphoresis Grade");
        clickElement(By.id("compareMe"));
        showAllTabs();
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("You are trying to add a CDE to itself. Please edit your Quick Board.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

    @Test
    public void cannotAddDatatypeText() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoardByModule("cde");
        goToCdeByName("Excisional Biopsy Colorectal Pathology Comment java.lang.String");
        clickElement(By.id("compareMe"));
        textPresent("Quick Board (1)");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");
        showAllTabs();
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("CDE Excisional Biopsy Colorectal Pathology Comment java.lang.String has a datatype other than 'Number' and may not be added to a score");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        clickElement(By.id("cancelCreate"));
    }

    @Test
    public void validRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoardByModule("cde");
        addCdeToQuickBoard("Disability Rating Scale (DRS) - Grooming disability scale");
        hangon(1);
        addCdeToQuickBoard("Disability Rating Scale (DRS) - Function level scale");
        hangon(1);
        goToCdeByName("DRS Total Score");
        showAllTabs();
        clickElement(By.id("derivationRules_tab"));
        clickElement(By.id("addNewScore"));
        textPresent("All 2 CDEs in your quickboard.");
        findElement(By.id("newDerivationRule.name")).sendKeys("DRS Score");
        clickElement(By.id("createDerivationRule"));
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        newCdeVersion();
        clickElement(By.partialLinkText("Disability Rating Scale (DRS) - Function level scale"));
        textPresent("Level of functioning (Physical, mental, emotional,");
        clickElement(By.linkText("Score / Derivations"));
        textPresent("This Data Element is used to derive to the following Data Elements:");
        clickElement(By.linkText("DRS Total Score"));
        clickElement(By.linkText("Score / Derivations"));
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        textNotPresent("Add Score");
        clickElement(By.id("removeDerivationRule-0"));
        newCdeVersion();
    }

}
