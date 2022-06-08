package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class SearchFormByQuestionNumTest extends NlmCdeBaseTest {

    @Test
    public void searchFormByQuestionNum() {
        goToFormSearch();
        findElement(By.id("ftsearch-input")).sendKeys("numQuestions:>200");
        hangon(0.5);
        clickElement(By.id("search.submit"));
        textPresent("Food Frequency Questionnaire (FFQ)");
        textPresent("Mitochondrial and Gastrointestinal Diseases Assessment");
        textPresent("Risk Factor Questionnaire (RFQ-U) - Pesticides (Work)");
        textPresent("3 results. Sorted by relevance.");
    }

}
