package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CdeReorderDetailTabsTest extends NlmCdeBaseTest {
    @Test
    public void CdeReorderDetailTabs() {
        mustBeLoggedInAs(ninds_username, password);
        String cdeName = "cde for test cde reorder detail tabs";
        goToCdeByName(cdeName);
        testPermissible();
        testNaming();
        testConcepts();
        testReferrenceDocuments();
        testProperties();
    }

    private void testIcon(String tabName) {
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-0" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-0" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-0" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-0" + postfix)).size(), 0);

        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-1" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-1" + postfix)).size(), 1);

        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveDown-2" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveUp-2" + postfix)).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveBottom-2" + postfix)).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath(prefix + "moveTop-2" + postfix)).size(), 1);
    }

    private void testPermissible() {
        String tabName = "permissibleValueDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Permissible Values")).click();
        textPresent("cs3");
        testIcon(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-1" + postfix)).getText().contains("pv1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-2" + postfix)).getText().contains("pv2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-1" + postfix)).getText().contains("pv2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "pv-0" + postfix)).getText().contains("pv3"));
    }

    private void testNaming() {
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Naming")).click();
        textPresent("Definition:");
        testIcon(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_2" + postfix)).getText().contains("cde for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs 1"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("cde for test cde reorder detail tabs 2"));
    }

    private void testConcepts() {
        String tabName = "conceptsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Concepts")).click();
        textPresent("Data Element");
        testIcon(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_1" + postfix)).getText().contains("cb1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_2" + postfix)).getText().contains("cn2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_1" + postfix)).getText().contains("cn2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "concept_cde_name_0" + postfix)).getText().contains("cn3"));
    }

    private void testReferrenceDocuments() {
        String tabName = "referrenceDocumentsDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Reference Documents")).click();
        textPresent("Language Code:");
        testIcon(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_2" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_1" + postfix)).getText().contains("rd2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "rd_id_0" + postfix)).getText().contains("rd3"));
    }

    private void testProperties() {
        String tabName = "propertiesDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        findElement(By.linkText("Properties")).click();
        textPresent("Add Property");
        testIcon(tabName);
        findElement(By.xpath(prefix + "moveDown-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("pk1"));
        findElement(By.xpath(prefix + "moveBottom-0" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_2" + postfix)).getText().contains("pk2"));
        findElement(By.xpath(prefix + "moveUp-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("pk2"));
        findElement(By.xpath(prefix + "moveTop-2" + postfix)).click();
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("pk3"));
    }
}
