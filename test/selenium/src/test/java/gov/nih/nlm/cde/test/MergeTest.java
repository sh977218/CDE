package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class MergeTest extends NlmCdeBaseTest {

    private void checkEverything() {
        clickElement(By.id("mergeFieldIdentifiers"));
        clickElement(By.id("mergeFieldsNaming"));
        clickElement(By.id("mergeFieldsProperties"));
        clickElement(By.id("mergeFieldsAttachments"));
        clickElement(By.id("mergeFieldsSources"));
        clickElement(By.id("mergeFieldsReferenceDocuments"));
        clickElement(By.id("mergeFieldsDataSets"));
        clickElement(By.id("mergeFieldsDerivationRules"));
    }

    private void createMergeRequest() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        addToCompare("Smoking Cessation Other Method Specify Text", "Smoking History Ind");
        clickElement(By.linkText("Retire & Merge"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        checkEverything();
        clickElement(By.cssSelector("[ng-click='sendMergeRequest()']"));
        hangon(1);
    }


    private void acceptMergeRequest() {
        mustBeLoggedInAs(ctepCurator_username, password);
        gotoInbox();
        clickElement(By.cssSelector(".accordion-toggle"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking Cessation Other Method Specify Text")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Smoking History Ind")));
        textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned.");
        textPresent("3279225");
        clickElement(By.cssSelector("[ng-click='showMergeApproveDialog(message)']"));
        findElement(By.cssSelector("[ng-model='elt.version']")).sendKeys(".2");
        textNotPresent("number has already been used");
        clickElement(By.cssSelector("#confirmNewVersion"));
        waitForESUpdate();
    }

    private void checkResult() {
        clickElement(By.cssSelector(".accordion-toggle"));
        if (!browser.equals("ie")) {
            clickElement(By.linkText("Smoking History Ind"));
            switchTabAndClose(1);
        } else goToCdeByName("Smoking History Ind");
        clickElement(By.linkText("Classification"));
        textPresent("Health Survey");
        textPresent("Cancer Related Risks");
        clickElement(By.linkText("Naming"));
        textPresent("Free-text field to capture another method used to help stop smoking that is not already specified or mentioned.");

        clickElement(By.linkText("Identifiers"));
        textPresent("3279225");
    }

    @Test
    public void mergeMineMineEverything() {
        mustBeLoggedInAs(ctepCurator_username, password);
        addToCompare("Common Toxicity Criteria Adverse Event Colitis Grade", "Common Toxicity Criteria Adverse Event Hypophosphatemia Grade");
        clickElement(By.id("retireMerge-0"));
        textPresent("Common Toxicity Criteria Adverse Event Colitis Grade");
        checkEverything();
        clickElement(By.id("sendMergeRequest"));
        hangon(2);
        findElement(By.cssSelector("[ng-model='elt.version']")).sendKeys(".2");
        clickElement(By.id("confirmNewVersion"));
        hangon(5);
        clickElement(By.id("naming_tab"));
        textPresent("Common Toxicity Criteria Adverse Event Colitis Grade");
        clickElement(By.id("classification_tab"));
        textPresent("Common Terminology Criteria for Adverse Events v3.0");

        clickElement(By.id("ids_tab"));
        textPresent("2005490");
        clickElement(By.id("properties_tab"));
        textPresent("Colitis Value");
        clickElement(By.id("referenceDocument_tab"));
        textPresent("Colitis ref doc");
        clickElement(By.id("dataSet_tab"));
        textPresent("Colitis note");
        clickElement(By.id("derivationRules_tab"));
        textPresent("Biomarker Gene Staining Method Score");

        goToCdeByName("Common Toxicity Criteria Adverse Event Colitis Grade");

        clickElement(By.id("history_tab"));
        textPresent("Merged to tinyId 75Y5R3FH5ar");
    }

    @Test
    public void mergeMineTheirsClassificationsOnly() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        addToCompare("Diagnosis Change Date java.util.Date", "Form Element End Date java.util.Date");
        hangon(1);
        clickElement(By.linkText("Retire & Merge"));
        textPresent("Fields to be Imported");
        clickElement(By.cssSelector("[ng-click='sendMergeRequest()']"));
        hangon(1);
        clickElement(By.linkText("Classification"));
        textPresent("caBIG");
        textPresent("caLIMS2");
        textPresent("gov.nih.nci.calims2.domain.inventory");
    }

    @Test
    public void mergeMineTheirsEverything() {
        createMergeRequest();
        acceptMergeRequest();
        checkResult();
    }

}
