package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearchShowNumberQuestionsTest extends NlmCdeBaseTest {

    public void formSearchShowNumberQuestionsTest() {
        mustBeLoggedOut();
        searchElt("Classification of Seizures", "form");
        Assert.assertEquals(findElement(By.id("dd_nQuestion-0")).getText(), "8");
    }
}
