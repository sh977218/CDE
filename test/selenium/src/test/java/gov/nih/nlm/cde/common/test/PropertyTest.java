package gov.nih.nlm.cde.common.test;

import org.junit.Assert;
import org.openqa.selenium.By;

public abstract class PropertyTest extends CommonTest {

    public void autocomplete(String eltName, String checkString, String expected) {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToEltByName(eltName);
        findElement(By.linkText("Properties")).click();
        findElement(By.id("addProperty")).click();
        findElement(By.name("key")).sendKeys(checkString);
        try {
            Assert.assertEquals(findElement(By.xpath("//div[@class='modal-body']/div[1]/ul/li/a")).getText(), expected);
        } catch (Exception e) {
            System.out.println("Re-typing autocomplete text");
            findElement(By.name("key")).clear();
            findElement(By.name("key")).sendKeys(checkString);
            Assert.assertEquals(findElement(By.xpath("//div[@class='modal-body']/div[1]/ul/li/a")).getText(), expected);
        }
        goHome();
    }

    public void addRemoveProperty(String eltName, String status) {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToEltByName(eltName, status);
        findElement(By.linkText("Properties")).click();
        findElement(By.id("addProperty")).click();
        findElement(By.name("key")).sendKeys("MyKey1");
        findElement(By.name("value")).sendKeys("MyValue1");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();
        findElement(By.id("addProperty")).click();
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();
        hangon(1);
        findElement(By.id("addProperty")).click();
        findElement(By.name("key")).sendKeys("MyKey3");
        findElement(By.name("value")).sendKeys("MyValue3");
        findElement(By.id("createProperty")).click();
        Assert.assertTrue(textPresent("Property Added"));
        modalGone();
        hangon(1);

        findElement(By.id("removeProperty-1")).click();
        findElement(By.id("confirmRemoveProperty-1")).click();
        textPresent("Property Removed");

        goToEltByName(eltName, status);
        findElement(By.linkText("Properties")).click();
        Assert.assertTrue(textPresent("MyKey1"));
        Assert.assertTrue(textPresent("MyKey3"));
        Assert.assertTrue(textPresent("MyValue1"));
        Assert.assertTrue(textPresent("MyValue3"));
        Assert.assertTrue(textNotPresent("MyValue2"));
        Assert.assertTrue(textNotPresent("MyValue2"));
    }

    public void richText(String eltName, String status) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, status);
        findElement(By.linkText("Properties")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_0']//i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_0']//button[@btn-radio=\"'html'\"]")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_0']//div[@contenteditable='true']")).sendKeys(" Hello From Selenium  ");
        findElement(By.xpath("//dd[@id='dd_prop_value_0']//button[@class='fa fa-check']")).click();
        textPresent("Hello From Selenium");
        hangon(1);
    }

    public void truncateRichText(String eltName, String status) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        findElement(By.linkText("Properties")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::button[text()='Rich Text']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::button[text()='Confirm']")).click();
        hangon(1);
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::span[text()='More']")).click();
        textPresent("516-543, DOI:10.1002/jmri.22259");
        hangon(1);
        textNotPresent("More", By.xpath("//*[@id='dd_prop_value_0']/div"));
    }

    public void truncatePlainText(String eltName, String status) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        findElement(By.linkText("Properties")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::i[@class='fa fa-edit']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::button[text()='Plain Text']")).click();
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::button[text()='Confirm']")).click();
        hangon(1);
        findElement(By.xpath("//dd[@id='dd_prop_value_2']/descendant::span[text()='More']")).click();
        textPresent("516-543, DOI:10.1002/jmri.22259");
        hangon(1);
        textNotPresent("More", By.xpath("//*[@id='dd_prop_value_0']/div"));
    }
}
