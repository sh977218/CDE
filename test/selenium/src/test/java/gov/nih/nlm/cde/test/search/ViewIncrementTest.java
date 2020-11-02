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
        textNotPresent("Views");
        for (int i = 0; i < 10; i++) {
            goToCdeByName(cdeName);
            textPresent("Someone who gives blood");
        }
        int nbOfViews = Integer.valueOf(findElement(By.cssSelector("[itemprop='views']")).getText());
        textPresent("Views");
        Assert.assertEquals(nbOfViews, 9);
    }
}
