package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NotFormEditorCantEdit extends NlmCdeBaseTest {

    @Test
    public void notFormEditorCantEdit() {
        mustBeLoggedInAs("ctepOnlyCurator", password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        clickElement(By.id("description_tab"));
        hangon(1);
        Assert.assertEquals(findElements(By.id("addSection")).size(), 0);
    }


}
