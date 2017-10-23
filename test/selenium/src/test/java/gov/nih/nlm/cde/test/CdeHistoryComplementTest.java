package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class CdeHistoryComplementTest extends NlmCdeBaseTest {

    @Test
    public void cdeHistoryComplement() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Metastatic Disease or Disorder Magnetic Resonance Imaging Cerebrospinal Fluid Diagnosis Ind-2";
        String newStatus = "Recorded";
        String oldStatus = "Qualified";

        String newName = "Alternative Name 1";
        String newDefinition = "Alternative Definition 1";
        goToCdeByName(cdeName);

        goToNaming();
        addNewName(newName, newDefinition, null);

        goToConcepts();
        clickElement(By.id("openNewConceptModalBtn"));
        findElement(By.xpath("//label[text()='Code Name']/following-sibling::input")).sendKeys("Code Name 1");
        findElement(By.xpath("//label[text()='Code ID']/following-sibling::input")).sendKeys("Code ID 1");
        clickElement(By.id("createNewConceptBtn"));
        modalGone();
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Alternative Name 1", By.xpath("//*[@id='Naming_2']"));
        textPresent("Alternative Definition 1", By.xpath("//*[@id='Naming_2']"));
        textPresent("Code Name 1", By.xpath("//*[@id='Concepts_6']"));
        textPresent("Code ID 1", By.xpath("//*[@id='Concepts_6']"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
        clickElement(By.xpath("//*[@id='editStatus']"));
        new Select(findElement(By.xpath("//label[text()='Registration Status']/following-sibling::select"))).selectByVisibleText(newStatus);
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        modalGone();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent(newStatus, By.xpath("//*[@id='Status']//ins"));
        textPresent(oldStatus, By.xpath("//*[@id='Status']//del"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
         goToIdentifiers();
        clickElement(By.id("openNewIdentifierModalBtn"));
        findElement(By.xpath("//label[text()='Source']/following-sibling::input")).sendKeys("Origin 1");
        findElement(By.xpath("//label[text()='Identifier']/following-sibling::input")).sendKeys("Identifier 1");
        findElement(By.xpath("//label[text()='Version']/following-sibling::input")).sendKeys("Version 1");
        clickElement(By.id("createNewIdentifierBtn"));
        modalGone();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent("Origin 1", By.xpath("//*[@id='Identifiers_1']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Identifier 1", By.xpath("//*[@id='Identifiers_1']//div[contains(@class,'arrayObjAdd')]"));
        textPresent("Version 1", By.xpath("//*[@id='Identifiers_1']//div[contains(@class,'arrayObjAdd')]"));
    }

}
