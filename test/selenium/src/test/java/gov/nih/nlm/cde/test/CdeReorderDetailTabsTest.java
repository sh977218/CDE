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

        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveDown-0']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveTop-0']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveDown-0']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveBottom-0']")).size(), 1);

        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveUp-1']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveTop-1']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveDown-1']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveBottom-1']")).size(), 1);

        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveUp-2']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveTop-2']")).size(), 1);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveDown-2']")).size(), 0);
        Assert.assertEquals(driver.findElements(By.xpath("//div[@id='" + tabName + "']//div//*[@id='moveBottom-2']")).size(), 0);
    }

    private void testPermissible() {
        findElement(By.linkText("Permissible Values")).click();
        textPresent("cs3");
        testIcon("permissibleValueDiv");
        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("pv-1")).getText().contains("pv1 Confirm Discard"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("pv-2")).getText().contains("pv2 Confirm Discard"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("pv-1")).getText().contains("pv2 Confirm Discard"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("pv-0")).getText().contains("pv3 Confirm Discard"));
    }

    private void testNaming() {
        findElement(By.linkText("Naming")).click();
        textPresent("Definition:");
        testIcon("namingDiv");
        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("dd_name_1")).getText().contains("cde for test cde reorder detail tabs Confirm Discard"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("dd_name-2")).getText().contains("cde for test cde reorder detail tabs 2 Confirm Discard"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("dd_name-1")).getText().contains("cde for test cde reorder detail tabs 2 Confirm Discard"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("dd_name-0")).getText().contains("cde for test cde reorder detail tabs 3 Confirm Discard"));
    }

    private void testConcepts() {
        findElement(By.linkText("Concepts")).click();
        textPresent("Data Element");
        testIcon("conceptsDiv");
        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("concept_cde_name_1")).getText().contains("cb1"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("concept_cde_name-2")).getText().contains("cb2"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("concept_cde_name-1")).getText().contains("cb2"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("concept_cde_name-0")).getText().contains("cb3"));
    }

    private void testReferrenceDocuments() {
        findElement(By.linkText("Reference Documents")).click();
        textPresent("Language Code:");
        testIcon("referrenceDocumentsDiv");
        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("rd_id_1")).getText().contains("rd1"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("rd_id-2")).getText().contains("rd2"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("rd_id-1")).getText().contains("rd2"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("rd_id-0")).getText().contains("rd3"));
    }

    private void testProperties() {
        findElement(By.linkText("Properties")).click();
        textPresent("Add Property");
        testIcon("propertiesDiv");
        findElement(By.id("moveDown-0")).click();
        Assert.assertTrue(findElement(By.id("dd_name_1")).getText().contains("pk1"));
        findElement(By.id("moveBottom-0")).click();
        Assert.assertTrue(findElement(By.id("dd_name-2")).getText().contains("pk2"));
        findElement(By.id("moveUp-2")).click();
        Assert.assertTrue(findElement(By.id("dd_name-1")).getText().contains("pk2"));
        findElement(By.id("moveTop-2")).click();
        Assert.assertTrue(findElement(By.id("dd_name-0")).getText().contains("pk3"));
    }
}
