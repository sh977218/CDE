package gov.nih.nlm.form.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;

public class BaseFormTest extends NlmCdeBaseTest {
    
    protected void gotoPublicForms() {
        findElement(By.linkText("Forms")).click();    
        findElement(By.id("resetSearch")).click();
        showSearchFilters();
    }
    
    protected void saveForm() {
        findElement(By.id("openSaveBottom")).click();
        findElement(By.name("version")).sendKeys("1");
        findElement(By.id("confirmSave")).click();  
        textPresent("Saved.");
        closeAlert();
        hangon(1);
    }

    protected void searchForm(String query) {
        findElement(By.name("ftsearch")).sendKeys("\"" + query + "\"");
        findElement(By.id("search.submit")).click();    
    }
}
