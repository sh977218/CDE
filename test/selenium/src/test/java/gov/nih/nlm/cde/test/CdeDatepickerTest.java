package gov.nih.nlm.cde.test;


import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeDatepickerTest extends NlmCdeBaseTest {

    @Test
    public void cdeDatepicker() {
        String cdeName = "Revised Childrens Anxiety and Depression Scale (RCADS) - School attendance trouble nervous afraid scale";
        mustBeLoggedInAs(ninds_username, password);
        goToCdeByName(cdeName);

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
        newCdeVersion();

        Assert.assertEquals(findElement(By.id("effectiveDate")).getText(), "02/16/2016");
        Assert.assertEquals(findElement(By.id("untilDate")).getText(), "03/19/2017");
    }
}
