package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LeavePageWarningTest extends NlmCdeBaseTest {

    @Test
    public void leavePageWarning() {
        String cdeName = "Intra-arterial Catheter Patient Not Administered Reason";
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        String definitionEditIconXpath = "//*[@id='definition_0']//*[contains(@class,'fa-edit')]";
        String definitionTextareaXpath = "//*[@id='definition_0']//textarea";
        String definitionConfirmBtnXpath = "//*[@id='definition_0']//*[contains(@class,'fa-check')]";

        clickElement(By.xpath(definitionEditIconXpath));
        findElement(By.xpath(definitionTextareaXpath)).sendKeys("[def change number 1]");
        clickElement(By.xpath(definitionConfirmBtnXpath));

        clickElement(By.linkText("CDEs"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.dismiss();

        clickElement(By.linkText("CDEs"));
        shortWait.until(ExpectedConditions.alertIsPresent());
        alert = driver.switchTo().alert();
        Assert.assertTrue(alert.getText().contains("are you sure you want to leave"));
        alert.accept();
        textPresent("Browse by Classification");
    }

}
