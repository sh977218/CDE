package gov.nih.nlm.cde.test.classification;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CuratorClassificationTreeTest extends NlmCdeBaseTest {

    @Test
    public void curatorCantEditClassificationTree() {
        mustBeLoggedInAs("ctepOnlyCurator", password);
        gotoClassificationMgt();
        new Select(findElement(By.id("orgToManage"))).selectByVisibleText("CTEP");

        textPresent("CRF_TTU");

        Assert.assertEquals(0, driver.findElements(By.xpath("//mat-icon[normalize-space() = 'subdirectory_arrow_left']")).size());
        Assert.assertEquals(0, driver.findElements(By.xpath("//mat-icon[normalize-space() = 'edit']")).size());
        Assert.assertEquals(0, driver.findElements(By.xpath("//mat-icon[normalize-space() = 'delete_outline']")).size());
        Assert.assertEquals(0, driver.findElements(By.xpath("//mat-icon[normalize-space() = 'transform']")).size());

    }

}
