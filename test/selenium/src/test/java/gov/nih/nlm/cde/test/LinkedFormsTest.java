package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class LinkedFormsTest extends NlmCdeBaseTest {

    @Test
    public void linkedForms() {
        String cdeName = "Psychiatric history clinical depression past year indicator";
        goToCdeByName(cdeName);
        goToRelatedContent();
        goToLinkedForm();
        textPresent("Medical History");
        goToRelatedContent();
        goToLinkedForm();
        textPresent("Contains data elements related to the study participant's/ subject's health history. (Examples of CDEs included: review of symptoms and conditions in specific body systems (pulmonary, endocrine, musculoskeletal, etc.)");
    }

}
