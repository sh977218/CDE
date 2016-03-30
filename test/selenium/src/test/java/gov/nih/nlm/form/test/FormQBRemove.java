package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQBRemove extends NlmCdeBaseTest {

    @Test
    public void formQuickBoardRemove() {
        addFormToQuickBoard("Hamilton Anxiety Rating Scale (HAM-A)");
        addFormToQuickBoard("Hand Held Dynamometry");
        goToQuickBoardByModule("form");
        textPresent("Hamilton Anxiety Rating Scale (HAM-A)");
        textPresent("Hand Held Dynamometry");
        findElement(By.id("remove_1"));
        textNotPresent("Hand Held Dynamometry");
        textPresent("Hamilton Anxiety Rating Scale (HAM-A)");
    }

}
