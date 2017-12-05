package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionLayoutTest extends QuestionTest {

    @Test
    public void questionsLayoutTest() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Question Layout Test Form";
        goToFormByName(formName);
        String sec1 = "first section";
        String sec2 = "second section";

        goToFormDescription();
        addSectionTop(sec1, null);
        addSectionBottom(sec2, null);

        textPresent(sec1);
        textPresent(sec2);

        addQuestionDialog(0);
        textPresent("Browse by Classification");
        scrollToViewById("browseOrg-caCORE");
        clickElement(By.id("browseOrg-caCORE"));
        textPresent("9 results for All Terms");
        clickElement(By.id("showHideFilters"));
        textPresent("Show Filters");
        clickElement(By.id("showHideFilters"));
        textPresent("Reference Editor java.lang.String");
        textPresent("Mage-OM (1)");
        textPresent("Qualified (9)");
        textNotPresent("Incomplete (");
        textPresent("java.util.Date (2)");
        textPresent("Value List (1)");

        clickElement(By.id("datatype-text-java.util.Date"));
        textPresent("2 results for All Terms");
        textNotPresent("Reference Editor java.lang.String");
        textNotPresent("Mage-OM (");
        textPresent("java.util.Date (2)");
        textPresent("Value List (1)");
        clickElement(By.id("cancelSelectQ"));

        clickElement(By.xpath("//*[@id='section_1']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-trash-o')]"));
        clickElement(By.xpath("//*[@id='section_1']//*[contains(@class,'editIconDiv')]//*[contains(@class,'label')]/*[contains(@class,'fa-check')]"));
        textNotPresent(sec2);
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'editIconDiv')]//i[contains(@class,'fa-trash-o')]"));
        clickElement(By.xpath("//*[@id='section_0']//*[contains(@class,'editIconDiv')]//*[contains(@class,'label')]/*[contains(@class,'fa-check')]"));
        textNotPresent(sec1);

        textPresent("There is no content yet.");

        String sec3 = "third section";
        addSectionBottom(sec3, null);

        textNotPresent("Show Filters");
        textNotPresent("results for");

        newFormVersion();
    }

}
