package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class HighlightTest extends NlmCdeBaseTest {

    @Test
    public void highlights() {

        // highlight - no fragment
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"using OMB Approved\"");
        clickElement(By.id("search.submit"));
        textPresent("the patient's self declared racial origination, independent of ethnic origination, using OMB approved categories");
        findElement(By.xpath("//*[@id='searchResult_0']//strong[.='OMB']"));

        // highlight with fragment
        goToCdeSearch();
        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("\"enzymatic processing of a polypeptide\"");
        clickElement(By.id("search.submit"));

        textPresent("A compound of two or more amino acids where the al [...]");
        textPresent(":The enzymatic processing of a polypeptide chain");
        findElement(By.xpath("//*[@id='searchResult_0']//strong[.='enzymatic']"));

    }


}
