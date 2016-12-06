package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    private void seeTableForms(){
        goHome();
        findElement(By.id("menu_forms_link")).click();
        findElement(By.id("browseOrg-TEST")).click();
        findElement(By.id("form_gridView")).click();
    }

    @Test
    public void seeFormSource() {
        mustBeLoggedOut();
        seeTableForms();
        textPresent("Other Names");
        textPresent("Steward");
        textPresent("Used by");
        textPresent("Identifiers");
        textPresent("Questions");

        textPresent("Alternate Name for a Table View Form!");
        textPresent("TESTOrg");
        textPresent("goodForTablesForm");

        clickElement(By.id("searchSettings"));
        clickElement(By.id("naming"));
        clickElement(By.id("stewardOrg"));
        clickElement(By.id("usedBy"));
        clickElement(By.id("registrationStatus"));
        clickElement(By.id("administrativeStatus"));
        clickElement(By.id("ids"));
        clickElement(By.id("source"));
        clickElement(By.id("updated"));
        clickElement(By.id("numQuestions"));
        clickElement(By.id("saveSettings"));
        textPresent("Settings saved!");
        seeTableForms();

        textNotPresent("Other Names");
        textNotPresent("Steward");
        textNotPresent("Used by");
        textNotPresent("Identifiers");
        textNotPresent("Questions", By.cssSelector("thead"));

        textNotPresent("Alternate Name for a Table View Form!");
        textNotPresent("TESTOrg");
        textNotPresent("goodForTablesForm");
        textPresent("To be deleted");
        textPresent("testFormIssuingOrg");
    }
}
