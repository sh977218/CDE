package gov.nih.nlm.cde.test.search;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ViewIncrementTest extends NlmCdeBaseTest {
    @Test
    public void viewIncrement() {
        String cdeName = "Tissue Donor Genetic Testing Other Disease or Disorder Specify";
        goToCdeByName(cdeName);
        textPresent("0 Views");
        assertNoElt(By.xpath("//dt[contains(.,'Views:')]"));
        for (int i = 0; i < 10; i++) {
            goToCdeByName(cdeName);
            textPresent("Someone who gives blood");
        }
        int nbOfViews = Integer.valueOf(findElement(By.id("viewsCount")).getText().split("\\s+")[0]);
        textPresent("9 Views");
        Assert.assertEquals(nbOfViews, 9);
        findElement(By.xpath("//dt[contains(.,'Views:')]/following-sibling::dd[1][contains(.,'9')]"));
    }
}
