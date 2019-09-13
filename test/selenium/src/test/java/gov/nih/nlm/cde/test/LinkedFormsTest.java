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
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (0)");
        findElement(By.cssSelector("#menu_qb_link")).sendKeys(Keys.ESCAPE);
        clickElement(By.id("openLinkedFormsModalBtn"));
        textPresent("Medical History");
        textPresent("There is 1 form that uses this cde");
        textPresent("Contains data elements related to the study participant's/ subject's health history. (Examples of CDEs included: review of symptoms and conditions in specific body systems (pulmonary, endocrine, musculoskeletal, etc.)");
        clickElement(By.id("addToCompare_0"));
        clickElement(By.id("closeLinkedFormsModalBtn"));
        checkAlert("Added to QuickBoard!");
        clickElement(By.id("boardsMenu"));
        textPresent("Quick Board (1)");
    }


}
