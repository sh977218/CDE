package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    private void seeTableForms(){
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
        textPresent("Used By");
        textPresent("Registration Status");
        textPresent("Identifiers");
        textPresent("Questions");

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
        textPresent("Steward");
        textPresent("Used By");
        textPresent("Registration Status");
        textPresent("Identifiers");
        textPresent("Questions");

        textPresent("Source");
    }
}
