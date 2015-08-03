package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;

public class CdeDatepickerTest extends NlmCdeBaseTest {

    @Test
    public void CdeDatepicker() {
        mustBeLoggedInAs(ninds_username, password);
        goToSearch("cde");
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("results for All Terms | NINDS |");
        findElement(By.id("eyeLink_0")).click();
        textPresent("General Details");
        findElement(By.id("editStatus")).click();
        textPresent("Update Registration Status");
        findElement(By.id("effectiveDateDatepicker")).click();
        textPresent("Today");
        textPresent("Clear");
        textPresent("Close");
        ((JavascriptExecutor) driver).executeScript("$(\"#effectiveDateDiv > ul > li.ng-scope > span > button.btn.btn-sm.btn-info.ng-binding\").click();");
        Date today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        hangon(1);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        String js_code = "function test() {" +
                "return $('#effectiveDate').first().val();" +
                "}; return test()";
        String effectiveDate_string = js.executeScript(js_code).toString();
        Date effectiveDate = new Date(effectiveDate_string);
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(today);
        cal2.setTime(effectiveDate);
        boolean sameDay = cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
                cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR);
        Assert.assertTrue(sameDay);

        findElement(By.id("effectiveDateDatepicker")).click();
        textPresent("Today");
        textPresent("Clear");
        textPresent("Close");
        ((JavascriptExecutor) driver).executeScript("$(\"#effectiveDateDiv > ul > li.ng-scope > span > button.btn.btn-sm.btn-danger.ng-binding\").click();");
        effectiveDate_string = js.executeScript(js_code).toString();
        Assert.assertTrue(effectiveDate_string.equals(""));
        findElement(By.id("cancelRegStatus")).click();
    }
}
