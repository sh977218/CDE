package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;


public class ResetPageNumberTest extends NlmCdeBaseTest {

    @Test
    public void resetPageNumber() {
        setLowStatusesVisible();
        includeRetiredSetting();
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).sendKeys("patient");
        clickElement(By.id("search.submit"));
        textPresent("Patient Ethnic Group Category ");

        // clear registration status reset page to 1
        clickElement(By.xpath("//*[@id='regstatus-Qualified']"));
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("2");
        textNotPresent("Patient Ethnic Group Category");
        clickElement(By.id("status_crumb"));
        textPresent("Patient Ethnic Group Category ");

        // clear data type reset page to 1
        clickElement(By.xpath("//*[@id='datatype-Value List']"));
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("2");
        textNotPresent("Patient Ethnic Group Category");
        clickElement(By.id("datatype_crumb"));
        textPresent("Patient Ethnic Group Category ");

        // clear classification reset page to 1
        clickElement(By.xpath("//*[@id='classif-NINDS']"));
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("2");
        textNotPresent("Patient Ethnic Group Category");
        clickElement(By.id("classif_crumb"));
        textPresent("Patient Ethnic Group Category ");

    }
}
