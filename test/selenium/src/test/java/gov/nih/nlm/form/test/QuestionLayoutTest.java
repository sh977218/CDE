package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.testng.annotations.Test;

public class QuestionLayoutTest extends BaseFormTest {

    @Test
    public void questionsLayoutTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Question Layout Test Form";

        String sec1 = "first section";
        String sec2 = "second section";

        addSection(sec1, "0 or more");
        addSection(sec2, "0 or more");

        textPresent(sec1);
        textPresent(sec2);

        textPresent("Show Question Search Area");
        startAddingQuestions();
        textPresent("Hide Question Search Area");
        textPresent("Browse by classification");
        // we are doing twice because of the double scroll bar and we are not sure how Selenium handles it.
        scrollToTop();
        scrollToTop();
        scrollToViewById("browseOrg-caCORE");
        clickElement(By.id("browseOrg-caCORE"));
        textPresent(" results for All Terms");
        clickElement(By.id("showHideFilters"));
        textPresent("Show Filters");

        clickElement(By.id("removeElt-1"));
        textNotPresent(sec2);
        clickElement(By.id("removeElt-0"));
        textNotPresent(sec1);

        textPresent("There is no content yet.");

        String sec3 = "third section";
        addSection(sec3, "0 or more");

        textNotPresent("Show Filters");
        textNotPresent("results for");
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

}
