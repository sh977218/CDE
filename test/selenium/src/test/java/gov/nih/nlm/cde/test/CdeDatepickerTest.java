package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
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

        clickElement(By.cssSelector("#effectiveDateDiv div div i"));
        new Select(findElement(By.xpath("//div[@id='effectiveDateDiv']//select[1]"))).selectByVisibleText("Feb");
        new Select(findElement(By.xpath("//div[@id='effectiveDateDiv']//select[2]"))).selectByVisibleText("2016");
        clickElement(By.xpath("//div[. = '16']"));

        clickElement(By.cssSelector("#untilDateDiv div div i"));
        new Select(findElement(By.xpath("//div[@id='untilDateDiv']//select[1]"))).selectByVisibleText("Mar");
        new Select(findElement(By.xpath("//div[@id='untilDateDiv']//select[2]"))).selectByVisibleText("2017");
        clickElement(By.xpath("//div[. = '19']"));

        clickElement(By.id("saveRegStatus"));
        textPresent("Saved");
        closeAlert();
        
        Assert.assertEquals("2/16/2016", findElement(By.id("effectiveDate")).getText());
        Assert.assertEquals("3/19/2017", findElement(By.id("untilDate")).getText());
    }
}
