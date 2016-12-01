package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearchShowNumberQuestionsTest extends NlmCdeBaseTest {

    @Test
    public void formSearchShowNumberQuestionsTest() {
        mustBeLoggedOut();
        searchElt("Classification of Seizures", "form");
        Assert.assertEquals(findElement(By.id("searchResult_0")).getText(), "8 Questions");

        searchElt("Form In Form Num Questions", "form");
        Assert.assertEquals(findElement(By.id("searchResult_0")).getText(), "21 Questions");
    }
}
