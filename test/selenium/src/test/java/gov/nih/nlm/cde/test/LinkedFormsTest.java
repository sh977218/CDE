package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import junit.framework.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class LinkedFormsTest extends NlmCdeBaseTest {

    @Test
    public void linkedForms() {
        goToCdeByName("Psychiatric history clinical depression past year indicator");
        showAllTabs();
        clickElement(By.id("forms_tab"));
        textPresent("Medical History");
        textPresent("There is 1 form that uses this CDE.");
        textPresent("Contains data elements related to the study participant's/ subject's health history. (Examples of CDEs included: review of symptoms and conditions in specific body systems (pulmonary, endocrine, muscu...");
        textPresent("47");
        textPresent("Quick Board (0)");
        clickElement(By.id("addToCompare_0"));
        textPresent("Quick Board (1)");
    }


}