package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionLayoutTest extends QuestionTest {

    @Test
    public void questionsLayout() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Question Layout Test Form";
        goToFormByName(formName);
        String sec1 = "first section";
        String sec2 = "second section";

        goToFormDescription();
        addSectionTop(sec1);
        addSectionBottom(sec2, null);

        addQuestionDialog(0);
        textPresent("Browse by Classification");
        scrollToViewById("browseOrg-caCORE");
        clickElement(By.id("browseOrg-caCORE"));
        textPresent("9 data element results for");
        clickElement(By.id("showHideFilters"));
        textPresent("Show Filters");
        clickElement(By.id("showHideFilters"));
        textPresent("Reference Editor java.lang.String");
        textPresent("Mage-OM (1)");
        textPresent("Qualified (9)");
        textNotPresent("Incomplete (");
        textPresent("Date (2)");
        textPresent("Value List (1)");

        clickElement(By.id("datatype-Date"));
        textPresent("2 data element results for");
        textNotPresent("Reference Editor java.lang.String");
        textNotPresent("Mage-OM (");
        textPresent("Date (2)");
        textPresent("Value List (1)");
        clickElement(By.id("cancelSelectQ"));

        deleteWithConfirm("//*[@id='section_1']//*[contains(@class,'sectionTitle')]");
        textNotPresent(sec2);
        deleteWithConfirm("//*[@id='section_0']//*[contains(@class,'sectionTitle')]");
        textNotPresent(sec1);

        textPresent("To begin building your form, find the Section button");

        String sec3 = "third section";
        addSectionBottom(sec3, null);

        textNotPresent("Show Filters");
        textNotPresent("results for");

        newFormVersion();
    }

}
