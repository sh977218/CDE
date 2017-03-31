package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormQBRemove extends NlmCdeBaseTest {

    @Test
    public void formQuickBoardRemove() {
        addFormToQuickBoard("Hamilton Anxiety Rating Scale (HAM-A)");
        addFormToQuickBoard("Grooved Pegboard Test");
        goToQuickBoardByModule("form");
        textPresent("Hamilton Anxiety Rating Scale (HAM-A)");
        textPresent("Grooved Pegboard Test");
        findElement(By.id("remove_1")).click();
        textNotPresent("Grooved Pegboard Test");
        textPresent("Hamilton Anxiety Rating Scale (HAM-A)");
    }

}
