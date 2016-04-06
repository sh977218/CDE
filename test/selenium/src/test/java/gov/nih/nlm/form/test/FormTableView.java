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

        findElement(By.id("searchSettings")).click();
        findElement(By.id("naming")).click();
        findElement(By.id("stewardOrg")).click();
        findElement(By.id("usedBy")).click();
        findElement(By.id("registrationStatus")).click();
        findElement(By.id("administrativeStatus")).click();
        findElement(By.id("ids")).click();
        findElement(By.id("source")).click();
        findElement(By.id("updated")).click();
        findElement(By.id("numQuestions")).click();
        findElement(By.id("saveSettings")).click();
        seeTableForms();

        textNotPresent("Other Names");
        textNotPresent("Steward");
        textNotPresent("Used by");
        textNotPresent("Identifiers");
        textNotPresent("Questions");

        textNotPresent("Alternate Name for a Table View Form!");
        textNotPresent("TESTOrg");
        textNotPresent("goodForTablesForm");
        textPresent("To be deleted");
        textPresent("testFormIssuingOrg");
    }
}
