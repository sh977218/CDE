package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class FormHistoryTest extends BaseFormTest {

    @Test
    public void formHistoryTest() {
        String newFormDef = "this is new form def";
        mustBeLoggedInAs(testAdmin_username, password);
        goToFormByName("FormHistoryTest");
        showAllTabs();
        clickElement(By.id("history_tab"));
        textPresent("02/01/2016 @ 11:48AM");

        clickElement(By.id("naming_tab"));
        textPresent("this form crated for testing form history");
        clickElement(By.xpath("//*[@id='dd_def_0']//i"));
        findElement(By.xpath("//*[@id='dd_def_0']//input")).clear();
        findElement(By.xpath("//*[@id='dd_def_0']//input")).sendKeys(newFormDef);
        clickElement(By.xpath("//*[@id='dd_def_0']//button[contains(text(),'Confirm')]"));
        textPresent("this form crated for testing form history 111", By.id("dd_def_0"));
        saveForm();
        closeAlert();
        goToFormByName("FormHistoryTest");
        showAllTabs();
        clickElement(By.id("history_tab"));
        textPresent(newFormDef);

    }
}
