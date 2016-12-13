package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class EditConceptsTest extends NlmCdeBaseTest {

    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepCurator_username, password);
        String cdeName = "Patient Photograph Malignant Neoplasm Assessment Date";

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
        textPresent(newDataElementConceptName, By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0_0']//*[@data-title='name']"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='historyCompareLeft_Data Element Concepts_0_0']//*[@data-title='originId']"));

        textPresent(newPropertyConceptName, By.xpath("//*[@id='historyCompareLeft_Property Concepts_0_3']//*[@data-title='name']"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='historyCompareLeft_Property Concepts_0_3']//*[@data-title='originId']"));

        textPresent(newObjectClassConceptName, By.xpath("//*[@id='historyCompareLeft_ObjectClass Concepts_0_0']//*[@data-title='name']"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='historyCompareLeft_ObjectClass Concepts_0_0']//*[@data-title='originId']"));

        clickElement(By.id("concepts_tab"));
        clickElement(By.id("removedataElementConcept-0"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent("Patient Photograph Malignant Neoplasm Assessment", By.xpath("//*[@id='historyCompareRight_Data Element Concepts_0_1']//*[@data-title='name']"));
        textPresent("2640357v1", By.xpath("//*[contains(@id, 'historyCompareRight_Data Element Concepts')]//*[@data-title='originId']"));
        textPresent(newPropertyConceptName, By.xpath("//*[contains(@id, 'historyCompareRight_Property Concepts')]//*[@data-title='name']"));
        textPresent(newPropertyConceptId, By.xpath("//*[contains(@id, 'historyCompareRight_Property Concepts')]//*[@data-title='originId']"));
        textPresent(newObjectClassConceptName, By.xpath("//*[contains(@id,'historyCompareRight_ObjectClass Concepts')]//*[@data-title='name']"));
        textPresent(newObjectClassConceptId, By.xpath("//*[contains(@id, 'historyCompareRight_ObjectClass Concepts')]//*[@data-title='originId']"));

        openCdeAudit(cdeName);
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);
    }
}
