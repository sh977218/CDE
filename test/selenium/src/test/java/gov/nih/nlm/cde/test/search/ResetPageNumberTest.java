package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class ResetPageNumberTest extends NlmCdeBaseTest {

    @Test
    public void resetSearch() {
        goToCdeSearch();
        clickElement(By.id("browseOrg-NINDS"));
        findElement(By.id("ftsearch-input")).sendKeys("patient");
        clickElement(By.id("search.submit"));
        textPresent("Patient Ethnic Group Category");
        clickElement(By.id("regstatus-Qualified"));
        findElement(By.xpath("//*[@id='goToPage']//input")).clear();
        hangon(1);
        findElement(By.xpath("//*[@id='goToPage']//input")).sendKeys("2");
        textNotPresent("Patient Ethnic Group Category");
        clickElement(By.id(""));

    }
}
