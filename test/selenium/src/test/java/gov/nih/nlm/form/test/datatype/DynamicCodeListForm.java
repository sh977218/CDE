package gov.nih.nlm.form.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DynamicCodeListForm extends NlmCdeBaseTest {

    @Test
    public void dynamicCodeListFormTest() {
        String formName = "Dynamic Code List Form";
        goToFormByName(formName);
        hangon(10);
        String options1 = driver.findElement(By.xpath("//*[@id='Long Dynamic Code List_0-0']")).getAttribute("outerHTML");
        Assert.assertTrue(options1.contains("HIV 2 gp125"));

        String options2 = driver.findElement(By.xpath("//*[@id='Short Dynamic Code List_0-1']")).getAttribute("outerHTML");
        Assert.assertTrue(options2.contains("Transfusion of Autologous Whole Blood into Peripheral Vein, Open Approach"));
    }

}
