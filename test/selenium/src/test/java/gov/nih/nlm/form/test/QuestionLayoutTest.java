package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionLayoutTest extends BaseFormTest {

    @Test
    public void questionsLayoutTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Question Layout Test Form";
        goToFormByName(formName);
        String sec1 = "first section";
        String sec2 = "second section";

        addSectionTop(sec1, "0 or more");
        addSectionBottom(sec2, "0 or more");

        textPresent(sec1);
        textPresent(sec2);

        textPresent("Show Question Search Area");
        startAddingQuestions();
        textPresent("Hide Question Search Area");
        textPresent("Browse by Classification");
        // we are doing twice because of the double scroll bar and we are not sure how Selenium handles it.
        scrollToTop();
        scrollToTop();
        scrollToViewById("browseOrg-caCORE");
        clickElement(By.id("browseOrg-caCORE"));
        textPresent(" results for All Terms");
        clickElement(By.id("showHideFilters"));
        textPresent("Show Filters");

        clickElement(By.xpath("//*[@id='section_1']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-trash-o')]"));
        textNotPresent(sec2);
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-trash-o')]"));
        textNotPresent(sec1);

        textPresent("There is no content yet.");

        String sec3 = "third section";
        addSectionBottom(sec3, "0 or more");

        textNotPresent("Show Filters");
        textNotPresent("results for");

        saveForm();
    }

}
