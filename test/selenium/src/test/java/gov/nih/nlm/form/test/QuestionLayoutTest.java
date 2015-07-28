package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.testng.annotations.Test;

public class QuestionLayoutTest extends BaseFormTest {

    @Test
    public void questionsLayoutTest() {
        Dimension currentWindowSize = getWindowSize();
        resizeWindow(1524, 1150);
        mustBeLoggedInAs(ctepCurator_username, password);
        String formName = "Question Layout Test Form";
        String formDef = "This form is used to test the permission of tests";
        String formV = "0.1";

        createForm(formName, formDef, formV, "CTEP");

        String sec1 = "first section";
        String sec2 = "second section";

        addSection(sec1, "0 or more");
        addSection(sec2, "0 or more");

        textPresent(sec1);
        textPresent(sec2);

        textPresent("Show Question Search Area");
        startAddingQuestions();
        textPresent("Hide Question Search Area");
        textPresent("Browse by organization");
        findElement(By.id("browseOrg-caBIG")).click();

        findElement(By.id("showHideFilters")).click();
        textPresent("Show Filters");

        findElement(By.id("removeElt-1")).click();
        textNotPresent(sec2);
        findElement(By.id("removeElt-0")).click();
        textNotPresent(sec1);

        textPresent("There is no content yet.");

        String sec3 = "thrid section";
        addSection(sec3, "0 or more");

        textNotPresent("Show Filters");
        textNotPresent("results for");
        resizeWindow(currentWindowSize.getWidth(), currentWindowSize.getHeight());
    }

}
