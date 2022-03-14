package gov.nih.nlm.cde.test.history;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CdeHistoryComplementTest extends NlmCdeBaseTest {

    @Test
    public void cdeHistoryComplement() {
        mustBeLoggedInAs(ctepEditor_username, password);
        String cdeName = "Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2";
        String newStatus = "Recorded";
        String oldStatus = "Qualified";

        String newName = "Alternative Name 1";
        String newDefinition = "Alternative Definition 1";
        goToCdeByName(cdeName);

        goToNaming();
        addNewDesignation(newName, null);
        addNewDefinition(newDefinition, false, null);

        goToConcepts();
        addNewConcept("Code Name 1", "Code ID 1", null);
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Alternative Name 1", By.xpath("//*[@id='Designation_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Alternative Definition 1", By.xpath("//*[@id='Definition_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Code Name 1", By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Code ID 1", By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjAdd')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
        editRegistrationStatus(newStatus, null, null, null, null);

        clickElement(By.id("viewChangesBtn"));
        textPresent(newStatus, By.xpath("//*[@id='Status']//td-ngx-text-diff"));
        textPresent(oldStatus, By.xpath("//*[@id='Status']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));
        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent(newStatus, By.xpath("//*[@id='Status']//td-ngx-text-diff"));
        textPresent(oldStatus, By.xpath("//*[@id='Status']//td-ngx-text-diff"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
        goToIdentifiers();
        addNewIdentifier("LOINC", "Identifier 1", "Version 1");

        clickElement(By.id("viewChangesBtn"));
        textPresent("LOINC", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Identifier 1", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Version 1", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("LOINC", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Identifier 1", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Version 1", By.xpath("//*[@id='Identifiers_0']//div[contains(@class,'arrayObjAdd')]"));
    }

}
