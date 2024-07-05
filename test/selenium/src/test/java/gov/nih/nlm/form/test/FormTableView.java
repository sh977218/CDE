package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    @Test
    public void seeFormSource() {
        goHome();
        clickElement(By.id("menu_forms_link"));
        clickElement(By.id("browseOrg-TEST"));
        clickElement(By.id("list_gridView"));

        textNotPresent("Other Names");
        textPresent("Steward");
        textPresent("Used By");
        textPresent("Identifiers");
        textPresent("Questions");

        textNotPresent("Alternate Name for a Table View Form!");
        clickElement(By.id("classif-Denise Test CS"));
        textPresent("TESTOrg");
        textPresent("goodForTablesForm");

        clickElement(By.id("tableViewSettings"));
        clickElement(By.id("naming"));
        clickElement(By.id("stewardOrg"));
        clickElement(By.id("usedBy"));
        clickElement(By.id("registrationStatus"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("ids"));
        clickElement(By.id("source"));
        clickElement(By.id("updated"));
        clickElement(By.id("numQuestions"));
        closeTableViewPreferenceModal();

        textPresent("Other Names");
        textNotPresent("Steward");
        textNotPresent("Used By");
        textNotPresent("Identifiers");
        textNotPresent("Questions", By.cssSelector("thead"));

        textPresent("Alternate Name for a Table View Form!");
        textNotPresent("TESTOrg");
        textNotPresent("goodForTablesForm");
        textPresent("Published");
        textPresent("testFormIssuingOrg");
    }
}
