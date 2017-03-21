package gov.nih.nlm.form.test.merge;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class MergeFormAndRetireCde extends NlmCdeBaseTest {

    @Test
    public void mergeFormAndRetireCde() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String form1 = "PHQ-9 quick depression assessment panel [Reported.PHQ]";
        String form2 = "Patient Health Questionnaire - 9 (PHQ-9) Depression Scale";
        addFormToQuickBoardByTinyId(form1);
        addFormToQuickBoardByTinyId(form2);
        goToQuickBoardByModule("form");
        clickElement(By.id("qb_form_compare"));

        clickElement(By.xpath("//*[@class='leftObj']/*[contains(@class,'mergeForm')]"));
        clickElement(By.id("retireCde"));
        scrollDownBy(100);
        hangon(2);
        clickElement(By.id("mergeFormBtn"));
        closeAlert();

        textNotPresent("Retired", By.id("leftQuestion_0"));
        textNotPresent("Retired", By.id("leftQuestion_1"));
        textPresent("Retired", By.id("leftQuestion_2"));
        textPresent("Retired", By.id("leftQuestion_3"));
        textPresent("Retired", By.id("leftQuestion_4"));
        textPresent("Retired", By.id("leftQuestion_5"));
        textPresent("Retired", By.id("leftQuestion_6"));
        textPresent("Retired", By.id("leftQuestion_7"));
        textPresent("Retired", By.id("leftQuestion_8"));
        textPresent("Retired", By.id("leftQuestion_9"));
        textPresent("Retired", By.id("leftQuestion_10"));

        goToFormByName(form1);
        textNotPresent("Warning: this form is retired.");

        goToCdeByName("Trouble falling or staying asleep, or sleeping too much in last 2 weeks [Reported.PHQ]");
        textNotPresent("Warning: this data element is retired.");

        goToFormByName(form2);
        clickElement(By.id("naming_tab"));
        textPresent(form1);
        clickElement(By.id("referenceDocument_tab"));
        textPresent("Description: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001 Sep;16(9):606-13.");
        clickElement(By.id("properties_tab"));
        textPresent("CopyrightStarted");
        clickElement(By.id("ids_tab"));
        textPresent("44249-1");
        textPresent("F0374");
        clickElement(By.id("history_tab"));
        textPresent("Merge from tinyId mJsGoMU1m");
    }
}
