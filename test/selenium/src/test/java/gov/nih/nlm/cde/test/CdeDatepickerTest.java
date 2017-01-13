package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.text.SimpleDateFormat;
import java.util.Date;

public class CdeDatepickerTest extends NlmCdeBaseTest {

    @Test
    public void cdeDatepicker() {
        String today_string = new SimpleDateFormat("MM/dd/yyyy").format(new Date());
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName("Revised Childrens Anxiety and Depression Scale (RCADS) - School attendance trouble nervous afraid scale");


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
        String effectiveDate_string = findElement(By.id("effectiveDate")).getText();
        Assert.assertEquals(today_string, effectiveDate_string);
        effectiveDate_string = findElement(By.id("untilDate")).getText();
        Assert.assertEquals(effectiveDate_string, "N/A");
    }
}
