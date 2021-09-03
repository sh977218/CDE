package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SearchLinkedForms extends NlmCdeBaseTest {

    @Test
    public void searchLinkedForms() {
        goToCdeSearch();

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Retired:>20");
        hangon(10);
        Assert.assertEquals(7, findElementsSize(By.xpath("//mat-option")));

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>2");
        hangon(10);
        Assert.assertEquals(10, findElementsSize(By.xpath("//mat-option")));

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Qualified:>68");
        hangon(10);
        Assert.assertEquals(2, findElementsSize(By.xpath("//mat-option")));

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:>68");
        hangon(10);
        Assert.assertEquals(2, findElementsSize(By.xpath("//mat-option")));

        findElement(By.id("ftsearch-input")).clear();
        findElement(By.id("ftsearch-input")).sendKeys("linkedForms.Standard:60");
        hangon(10);
        Assert.assertEquals(7, findElementsSize(By.xpath("//mat-option")));
    }

}
