package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class NotFormEditorCantEdit extends NlmCdeBaseTest {

    @Test
    public void notFormEditorCantEdit() {
        mustBeLoggedInAs(ctepOnlyEditor, password);
        goToFormByName("Traumatic Brain Injury - Adverse Events");
        goToFormDescription();
        Assert.assertEquals(driver.findElements(By.id("addSection")).size(), 0);
    }


}
