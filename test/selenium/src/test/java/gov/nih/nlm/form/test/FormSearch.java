package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormSearch extends BaseFormTest {

    @Test
    public void findFormByCde() {
        mustBeLoggedInAs(ctepCurator_username, password);

        String cdeName = "Therapeutic Procedure Created Date java.util.Date";

        String formName = "Find By CDE";
        String formDef = "Fill out carefully!";
        String formV = "0.1alpha";

        createForm(formName, formDef, formV, "CTEP");

        clickElement(By.linkText("Form Description"));

        new CreateEditSectionTest().addSection("Answer List Section", null);

        startAddingQuestions();
        new QuestionTest().addQuestionToSection(cdeName, 0);
        saveForm();

        goToCdeByName(cdeName);
        showAllTabs();
        clickElement(By.id("forms_tab"));

        textPresent(formName);
    }

    @Test
    public void noPinAllNoExport() {
        // this test will be removed when the features are implemented.
        goToFormSearch();
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("Expand All");
        textNotPresent("Pin All");
    }

}
