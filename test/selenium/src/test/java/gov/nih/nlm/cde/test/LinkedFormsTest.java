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
        findElement(By.id("forms_tab")).click();
        textPresent("Medical History");
        textPresent("There is 1 form that uses this CDE.");
        textPresent("Contains data elements related to the study participant's/ subject's health history. (Examples of CDEs included: review of symptoms and conditions in specific body systems (pulmonary, endocrine, muscu...");
        textPresent("47");
        textPresent("Quick Board (0)");
        findElement(By.id("addToCompare_0")).click();
        textPresent("Quick Board (1)");
    }


}
