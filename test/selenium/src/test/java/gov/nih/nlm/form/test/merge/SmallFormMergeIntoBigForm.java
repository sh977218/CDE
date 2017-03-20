package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SmallFormMergeIntoBigForm extends NlmCdeBaseTest {

    @Test
    public void smallFormMergeIntoBigForm() {
        mustBeLoggedInAs(promis_username, password);
        String form1 = "PROMIS SF v1.0-Sleep Disturbance 4a";
        String form2 = "PROMIS SF v1.0-Sleep Disturbance 6a";
        clickElement(By.id("menu_forms_link"));
        findElement(By.id("ftsearch-input")).sendKeys(EltIdMaps.eltMap.get(form1));
        clickElement(By.id("menu_forms_link"));
        findElement(By.id("ftsearch-input")).sendKeys(EltIdMaps.eltMap.get(form2));
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.id("retireCde"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));
        textPresent("Form merged");
        closeAlert();

        goToFormByName(form1);
        textNotPresent("Warning: this form is retired.");

        goToCdeByName("Patient-Reported Outcome Measurement Information System (PROMIS) - Awake early time lack sleep assessment past week scale");
        textPresent("Warning: this data element is retired.");
        goToCdeByName("In the past 7 days I was satisfied with my sleep.");
        textNotPresent("Warning: this data element is retired.");

        goToFormByName(form2);
        clickElement(By.id("naming_tab"));
        textPresent(form1);
        clickElement(By.id("ids_tab"));
        textPresent("795B07C1-067E-4FBD-9B60-A57985E69B5D");
        clickElement(By.id("history_tab"));
        textPresent("Merge from tinyId Q1JxnV2OYIx");
    }
}
