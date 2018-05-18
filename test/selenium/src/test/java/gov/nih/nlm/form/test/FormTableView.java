package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    @Test
    public void seeFormSource() {
        mustBeLoggedOut();

        clickElement(By.id("menu_forms_link"));
        clickElement(By.id("browseOrg-TEST"));
        clickElement(By.id("list_gridView"));

        textNotPresent("Other Names");
        textPresent("Steward");
        textPresent("Used by");
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

        textPresent("Other Names");
        textNotPresent("Steward");
        textNotPresent("Used by");
        textNotPresent("Identifiers");
        textNotPresent("Questions", By.cssSelector("thead"));

        textPresent("Alternate Name for a Table View Form!");
        textNotPresent("TESTOrg");
        textNotPresent("goodForTablesForm");
        textPresent("To be deleted");
        textPresent("testFormIssuingOrg");
    }
}
