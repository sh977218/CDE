package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.EltIdMaps;
import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NotOwnSourceFormNotRetire extends NlmCdeBaseTest {

    @Test
    public void notOwnSourceFormNotRetire() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "Patient Health Questionnaire - 9 (PHQ-9) Depression Scale";
        String form2 = "PHQ-9 quick depression assessment panel [Reported.PHQ]";
        clickElement(By.id("menu_forms_link"));
        findElement(By.id("ftsearch-input")).sendKeys(EltIdMaps.eltMap.get(form1));
        clickElement(By.id("menu_forms_link"));
        findElement(By.id("ftsearch-input")).sendKeys(EltIdMaps.eltMap.get(form2));
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));
        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));

        closeAlert();
    }
}
