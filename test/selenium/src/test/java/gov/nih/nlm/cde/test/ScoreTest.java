package gov.nih.nlm.cde.test;

import gov.nih.nlm.common.test.QuickBoardTest;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ScoreTest extends NlmCdeBaseTest {

    private QuickBoardTest qbTest = new QuickBoardTest();

    @Test
    public void cannotCreateWithZeroCdes() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoard("cde");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");
        findElement(By.linkText("Score / Derivations")).click();
        findElement(By.id("addNewScore")).click();
        textPresent("There are no CDEs in your Quick Board. Add some before you can create a rule.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        findElement(By.id("cancelCreate")).click();
    }

    @Test
    public void cannotAddSelfToRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoard("cde");
        goToCdeByName("Common Toxicity Criteria Adverse Event Diaphoresis Grade");
        findElement(By.id("compareMe")).click();
        findElement(By.linkText("Score / Derivations")).click();
        findElement(By.id("addNewScore")).click();
        textPresent("You are trying to add a CDE to itself. Please edit your Quick Board.");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        findElement(By.id("cancelCreate")).click();
    }

    @Test
    public void cannotAddDatatypeText() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoard("cde");
        goToCdeByName("Excisional Biopsy Colorectal Pathology Comment java.lang.String");
        clickElement(By.id("compareMe"));
        textPresent("Quick Board (1)");
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");
        clickElement(By.linkText("Score / Derivations"));
        clickElement(By.id("addNewScore"));
        textPresent("CDE Excisional Biopsy Colorectal Pathology Comment java.lang.String has a datatype other than 'Number' and may not be added to a score");
        wait.until(ExpectedConditions.not(ExpectedConditions.elementToBeClickable(By.id("createDerivationRule"))));
        findElement(By.id("cancelCreate")).click();
    }

    @Test
    public void validRule() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        qbTest.emptyQuickBoard("cde");
        addToQuickBoard("Disability Rating Scale (DRS) - Grooming disability scale");
        hangon(1);
        addToQuickBoard("Disability Rating Scale (DRS) - Function level scale");
        hangon(1);
        goToCdeByName("DRS Total Score");
        findElement(By.linkText("Score / Derivations")).click();
        findElement(By.id("addNewScore")).click();
        textPresent("All 2 CDEs in your quickboard.");
        findElement(By.id("newDerivationRule.name")).sendKeys("DRS Score");
        findElement(By.id("createDerivationRule")).click();
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        newCdeVersion();
        findElement(By.partialLinkText("Disability Rating Scale (DRS) - Function level scale")).click();
        textPresent("Level of functioning (Physical, mental, emotional,");
        findElement(By.linkText("Score / Derivations")).click();
        textPresent("This Data Element is used to derive to the following Data Elements:");
        findElement(By.linkText("DRS Total Score")).click();
        findElement(By.linkText("Score / Derivations")).click();
        textPresent("Disability Rating Scale (DRS) - Grooming disability scale");
        textPresent("Disability Rating Scale (DRS) - Function level scale");
        textNotPresent("Add Score");
        findElement(By.id("removeDerivationRule-0")).click();
        newCdeVersion();
    }

}
