package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionTextTableView extends NlmCdeBaseTest {

    @Test
    public void questionTextTableView() {
        searchElt("Question Text Column CDE", "cde");
        clickElement(By.id("cde_gridView"));
        textPresent("QuestionText001");
        textPresent("QuestionText002");
        textNotPresent("OtherName001");
        textNotPresent("OtherName002");
        clickElement(By.id("searchSettings"));
        clickElement(By.id("questionTexts"));
        clickElement(By.id("naming"));
        hangon(1);
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved");
        closeAlert();
        textNotPresent("QuestionText001");
        textNotPresent("QuestionText002");
        textPresent("OtherName001");
        textPresent("OtherName002");
    }

}
