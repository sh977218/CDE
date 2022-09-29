package gov.nih.nlm.cde.test.history;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeHistoryExpendCollapseTest extends NlmCdeBaseTest {
    @Test
    public void cdeLongHistory() {
        String cdeName = "cde for test cde reorder detail tabs";
        goToCdeByName(cdeName);
        Assert.assertEquals(findElementsSize(By.xpath("//*[@id='historyTable']/tbody/tr")), 4);
        clickElement(By.id("expendHistory"));
        Assert.assertTrue(findElementsSize(By.xpath("//*[@id='historyTable']/tbody/tr")) > 4);
        clickElement(By.id("collapseHistory"));
        Assert.assertEquals(findElementsSize(By.xpath("//*[@id='historyTable']/tbody/tr")), 4);
    }
}
