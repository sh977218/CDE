package gov.nih.nlm.form.test;

import gov.nih.nlm.common.test.ViewTabTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormTableView extends BaseFormTest {

    @Test
    public void goToEltByName() {
        goToFormSearch();
        findElement(By.id("browseOrg-NINDS")).click();
    }
}
