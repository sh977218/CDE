package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LinkedFormsTest extends NlmCdeBaseTest {

    @Test
    public void linkedForms() {
        goToCdeByName("Psychiatric history clinical depression past year indicator");
        textPresent("Quick Board (0)");
        clickElement(By.id("openLinkedFormsModalBtn"));
        textPresent("Medical History");
        textPresent("There is 1 form that uses this cde");
        textPresent("Contains data elements related to the study participant's/ subject's health history. (Examples of CDEs included: review of symptoms and conditions in specific body systems (pulmonary, endocrine, musculoskeletal, etc.)");
        clickElement(By.id("addToCompare_0"));
        textPresent("Added to QuickBoard!");
        closeAlert();
        clickElement(By.id("closeLinkedFormsModalBtn"));
        textPresent("Quick Board (1)");
    }


}
