package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class EditConceptsTest extends NlmCdeBaseTest {

    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "If Yes Please Enter the Date";

        String newDataElementConceptName = "DEC1";
        String newDataElementConceptId = "DEC_CODE_111";

        String newObjectClassConceptName = "OC1";
        String newObjectClassConceptId = "OC_CODE_111";

        String newPropertyConceptName = "Prop1";
        String newPropertyConceptId = "Prop_CODE_111";

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("concepts_tab"));

        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys(newDataElementConceptName);
        findElement(By.name("codeId")).sendKeys(newDataElementConceptId);
        clickElement(By.id("createConcept"));

        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys(newObjectClassConceptName);
        findElement(By.name("codeId")).sendKeys(newObjectClassConceptId);
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Class");
        clickElement(By.id("createConcept"));

        clickElement(By.id("addConcept"));
        findElement(By.name("name")).sendKeys(newPropertyConceptName);
        findElement(By.name("codeId")).sendKeys(newPropertyConceptId);
        new Select(driver.findElement(By.name("conceptType"))).selectByVisibleText("Property");
        clickElement(By.id("createConcept"));

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("concepts_tab"));
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newDataElementConceptName, By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0']//*[contains(@class,'name')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0']//*[contains(@class,'originId')]"));

        textPresent(newPropertyConceptName, By.xpath("//*[@id='historyCompareLeft_Property Concepts_3']//*[contains(@class,'name')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='historyCompareLeft_Property Concepts_3']//*[contains(@class,'originId')]"));

        textPresent(newObjectClassConceptName, By.xpath("//*[@id='historyCompareLeft_ObjectClass Concepts_0']//*[contains(@class,'name')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='historyCompareLeft_ObjectClass Concepts_0']//*[contains(@class,'originId')]"));

        clickElement(By.id("concepts_tab"));
        clickElement(By.id("removedataElementConcept-0"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(cdeName, By.xpath("//*[@id='historyCompareRight_Data Element Concepts_0']//*[contains(@class,'name')]"));
        textPresent("2640357v1", By.xpath("//*[@id='historyCompareRight_Data Element Concepts_0']//*[contains(@class,'originId')]"));
        textPresent("Photograph", By.xpath("//*[@id='historyCompareRight_Property Concepts_0']//*[contains(@class,'name')]"));
        textPresent("C86035", By.xpath("//*[@id='historyCompareRight_Property Concepts_0']//*[contains(@class,'originId')]"));
        textPresent("Patient", By.xpath("//*[@id='historyCompareRight_ObjectClass Concepts_0']//*[contains(@class,'name')]"));
        textPresent("C16960", By.xpath("//*[@id='historyCompareRight_ObjectClass Concepts_0']//*[contains(@class,'originId')]"));

        openCdeAudit(cdeName);
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);
    }
}
