package gov.nih.nlm.form.test.datatypeTest;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class DynamicCodeListForm extends NlmCdeBaseTest {
    String foundCodeNameLongList = "HIV 2 gp125";
    String foundCodeNameShortList = "Transfusion of Autologous Whole Blood into Peripheral Vein, Percutaneous Approach";

    private void doIt() {
        String formName = "Dynamic Code List Form";
        goToFormByName(formName);
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//*[@id='Long Dynamic Code List_0-0']")));
        String options1 = driver.findElement(By.xpath("//*[@id='Long Dynamic Code List_0-0']")).getAttribute("outerHTML");
        Assert.assertTrue(options1.contains(foundCodeNameLongList), "Actually Contains: " + options1);

        String options2 = driver.findElement(By.xpath("//*[@id='Short Dynamic Code List_0-1']")).getAttribute("outerHTML");
        Assert.assertTrue(options2.contains(foundCodeNameShortList), "Actually Contains: " + options2);
    }

    @Test
    public void dynamicCodeListFormTest() {
        try {
            doIt();
        } catch (Throwable e) {
            doIt();
        }
    }

}
