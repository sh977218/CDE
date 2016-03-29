package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    @Test
    public void goToEltByName() {
        findElement(By.id("cde_gridView")).click();
        goToFormSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        findElement(By.id("source")).click();
        findElement(By.id("saveSettings")).click();
        findElement(By.id("form_gridView")).click();
    }
}
