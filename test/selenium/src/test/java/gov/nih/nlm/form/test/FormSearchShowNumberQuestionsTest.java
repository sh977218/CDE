package gov.nih.nlm.form.test.properties.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearchShowNumberQuestionsTest extends NlmCdeBaseTest {

    @Test
    public void formSearchShowNumberQuestionsTest() {
        mustBeLoggedOut();
        searchElt("Classification of Seizures", "form");
        textPresent("8 Questions", By.id("searchResult_0"));

        searchElt("Form In Form Num Questions", "form");
       textPresent("21 Questions", By.id("searchResult_0"));
    }
}
