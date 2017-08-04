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
        new Select(driver.findElement(By.name("orgToManage"))).selectByVisibleText("CTEP");

        textPresent("CRF_TTU");

        Assert.assertEquals(0, driver.findElements(By.cssSelector(".fa-share.fa-rotate-180")).size());
        Assert.assertEquals(0, driver.findElements(By.cssSelector(".fa-pencil")).size());
        Assert.assertEquals(0, driver.findElements(By.cssSelector(".fa-trash-o")).size());
        Assert.assertEquals(0, driver.findElements(By.cssSelector(".fa-retweet")).size());

    }

}
