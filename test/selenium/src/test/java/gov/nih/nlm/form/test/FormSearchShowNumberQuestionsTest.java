package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearchShowNumberQuestionsTest extends NlmCdeBaseTest {

    @Test
    public void formSearchShowNumberQuestionsTest() {
        searchElt("Parkinson's Disease Sleep Scale (PDSS)", "form", null);
        Assert.assertEquals(findElement(By.id("nQuestion-0")).getText(), "15");

    }
}
