package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
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
        textPresent(newDataElementConceptName, By.xpath("//*[@id='historyCompare_Concept_1']/div[contains(@class,'left')]//div[contains(@class,'name')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='historyCompare_Concept_1']/div[contains(@class,'left')]//div[contains(@class,'originId')]"));

        textPresent(newObjectClassConceptName, By.xpath("//*[@id='historyCompare_ObjectClass Concept_1']/div[contains(@class,'left')]//div[contains(@class,'name')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='historyCompare_ObjectClass Concept_1']/div[contains(@class,'left')]//div[contains(@class,'originId')]"));

        textPresent(newPropertyConceptName, By.xpath("//*[@id='historyCompare_Property Concept_3']/div[contains(@class,'left')]//div[contains(@class,'name')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='historyCompare_Property Concept_3']/div[contains(@class,'left')]//div[contains(@class,'originId')]"));
        
        clickElement(By.id("concepts_tab"));
        clickElement(By.id("removedataElementConcept-1"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));

        newCdeVersion();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("concepts_tab"));
        textNotPresent(newDataElementConceptName);
        textNotPresent(newDataElementConceptId);
        textNotPresent(newObjectClassConceptName);
        textNotPresent(newObjectClassConceptId);
        textNotPresent(newPropertyConceptName);
        textNotPresent(newPropertyConceptId);


        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 3);
        checkInHistory("Concepts", "DEC_CODE_111", "");
        checkInHistory("Concepts", "OC_CODE_111", "");
        checkInHistory("Concepts", "Prop_CODE_111", "");

        openCdeAudit(cdeName);
        textPresent("DEC_CODE_111");
        textPresent("OC_CODE_111");
        textPresent("Prop_CODE_111");
    }
}
