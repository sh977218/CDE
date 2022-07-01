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

        String options1Xpath = "//*[@id='Long Dynamic Code List_0-0']";
        clickElement(By.xpath(options1Xpath));
        String options1OuterHtml = findElement(By.xpath(options1Xpath)).getAttribute("outerHTML");
        Assert.assertTrue(options1OuterHtml.contains(foundCodeNameLongList), "Actually Contains: " + options1OuterHtml);

        String options2Xpath = "//*[@id='Short Dynamic Code List_0-1']";
        clickElement(By.xpath(options2Xpath));
        String options2OuterHtml = findElement(By.xpath(options2Xpath)).getAttribute("outerHTML");
        Assert.assertTrue(options2OuterHtml.contains(foundCodeNameShortList), "Actually Contains: " + options2OuterHtml);
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
