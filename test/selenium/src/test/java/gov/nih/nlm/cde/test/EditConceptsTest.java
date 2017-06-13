package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
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

        clickElement(By.id("concepts_tab"));
        addNewConcept(newDataElementConceptName, newDataElementConceptId, null, null);
        addNewConcept(newObjectClassConceptName, newObjectClassConceptId, null, "Class");
        addNewConcept(newPropertyConceptName, newPropertyConceptId, null, "Property");

        newCdeVersion();

        goToCdeByName(cdeName);

        clickElement(By.id("concepts_tab"));
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newPropertyConceptName, By.xpath("//*[@id='Concepts_3']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='Concepts_3']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newObjectClassConceptName, By.xpath("//*[@id='Concepts_5']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='Concepts_5']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newDataElementConceptName, By.xpath("//*[@id='Concepts_7']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='Concepts_7']//div[contains(@class,'arrayObjAdd')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
        clickElement(By.id("concepts_tab"));
        clickElement(By.id("removedataElementConcept-1"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));
        newCdeVersion();

        clickElement(By.id("history_tab"));
        selectHistoryAndCompare(1, 2);
        textPresent(newPropertyConceptName, By.xpath("//*[@id='Concepts_3']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='Concepts_3']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newObjectClassConceptName, By.xpath("//*[@id='Concepts_5']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='Concepts_5']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newDataElementConceptName, By.xpath("//*[@id='Concepts_8']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='Concepts_8']//div[contains(@class,'arrayObjRemove')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        openCdeAudit(cdeName);
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);
    }
}
