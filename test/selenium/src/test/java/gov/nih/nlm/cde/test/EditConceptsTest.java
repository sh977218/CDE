package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class EditConceptsTest extends NlmCdeBaseTest {

    @Test
    public void editConcepts() {
        mustBeLoggedInAs(ctepEditor_username, password);
        String cdeName = "Patient Photograph Malignant Neoplasm Assessment Date";

        String newDataElementConceptName = "DEC1";
        String newDataElementConceptId = "DEC_CODE_111";

        String newObjectClassConceptName = "OC1";
        String newObjectClassConceptId = "OC_CODE_111";

        String newPropertyConceptName = "Prop1";
        String newPropertyConceptId = "Prop_CODE_111";

        goToCdeByName(cdeName);

        goToConcepts();
        addNewConcept(newDataElementConceptName, newDataElementConceptId, null);
        addNewConcept(newObjectClassConceptName, newObjectClassConceptId, "Class");
        addNewConcept(newPropertyConceptName, newPropertyConceptId, "Property");

        newCdeVersion();

        goToCdeByName(cdeName);

        goToConcepts();
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent(newPropertyConceptName, By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newObjectClassConceptName, By.xpath("//*[@id='Concepts_1']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='Concepts_1']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newDataElementConceptName, By.xpath("//*[@id='Concepts_2']//div[contains(@class,'arrayObjAdd')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='Concepts_2']//div[contains(@class,'arrayObjAdd')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        goToCdeByName(cdeName);
        goToConcepts();
        clickElement(By.id("removedataElementConcept-1"));
        clickElement(By.id("removeobjectClass-1"));
        clickElement(By.id("removeproperty-3"));
        newCdeVersion();

        goToHistory();
        selectHistoryAndCompare(1, 2);
        textPresent(newPropertyConceptName, By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newPropertyConceptId, By.xpath("//*[@id='Concepts_0']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newObjectClassConceptName, By.xpath("//*[@id='Concepts_1']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newObjectClassConceptId, By.xpath("//*[@id='Concepts_1']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newDataElementConceptName, By.xpath("//*[@id='Concepts_2']//div[contains(@class,'arrayObjRemove')]"));
        textPresent(newDataElementConceptId, By.xpath("//*[@id='Concepts_2']//div[contains(@class,'arrayObjRemove')]"));
        clickElement(By.id("closeHistoryCompareModal"));

        modalGone();
        logout();
        openAuditDataElement(cdeName);
        textPresent(newDataElementConceptId);
        textPresent(newObjectClassConceptId);
        textPresent(newPropertyConceptId);
    }

}
