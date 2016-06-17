package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;

public class CdeDatepickerTest extends NlmCdeBaseTest {

    @Test
    public void cdeDatepicker() {
        mustBeLoggedInAs(ninds_username, password);
        goToSearch("cde");
        clickElement(By.id("browseOrg-NINDS"));
        textPresent("results for All Terms | NINDS |");
        clickElement(By.id("linkToElt_0"));
        textPresent("General Details");
        showAllTabs();
        clickElement(By.id("status_tab"));
        textPresent("Unresolved Issue");
        clickElement(By.id("editStatus"));
        textPresent("Update Registration Status");
        clickElement(By.id("effectiveDateDatepicker"));
        textPresent("Today");
        textPresent("Clear");
        textPresent("Close");
        clickElement(By.xpath("//button[contains(text(),'Today')]"));
        clickElement(By.id("untilDateDatepicker"));
        textPresent("Today");
        textPresent("Clear");
        textPresent("Close");
        clickElement(By.xpath("//button[contains(text(),'Clear')]"));
        clickElement(By.id("saveRegStatus"));
        closeAlert();
        Date today = new Date();
        String effectiveDate_string = findElement(By.id("effectiveDate")).getText();
        Date effectiveDate = null;
        try {
            System.out.println("effectiveDate_string:" + effectiveDate_string);
            effectiveDate = formatter.parse(effectiveDate_string);
            System.out.println("effectiveDate:" + effectiveDate);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(today);
        cal2.setTime(effectiveDate);
        boolean sameDay = cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
                cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR);
        Assert.assertTrue(sameDay);
        effectiveDate_string = findElement(By.id("untilDate")).getText();
        Assert.assertEquals(effectiveDate_string, "N/A");
    }
}
