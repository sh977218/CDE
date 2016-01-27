package gov.nih.nlm.common.test;

import org.junit.Assert;
import org.openqa.selenium.By;

public abstract class PropertyTest extends CommonTest {

    public void autocomplete(String eltName, String checkString, String expected) {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToEltByName(eltName);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.id("addProperty"));
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
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.id("addProperty"));
        findElement(By.name("key")).sendKeys("MyKey1");
        findElement(By.name("value")).sendKeys("MyValue1");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();
        clickElement(By.id("addProperty"));
        findElement(By.name("key")).sendKeys("MyKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();
        clickElement(By.id("addProperty"));
        findElement(By.name("key")).sendKeys("MyKey3");
        findElement(By.name("value")).sendKeys("MyValue3");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("removeProperty-1"));
        clickElement(By.id("confirmRemoveProperty-1"));
        textPresent("Property Removed");
        closeAlert();

        goToEltByName(eltName, status);
        clickElement(By.linkText("Properties"));
        textPresent("MyKey1");
        textPresent("MyKey3");
        textPresent("MyValue1");
        textPresent("MyValue3");
        textNotPresent("MyValue2");
        textNotPresent("MyValue2");
    }

    public void richText(String eltName, String status) {
        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[@uib-btn-radio=\"'html'\"]"));
        findElement(By.xpath("//*[@id='dd_prop_value_0']//div[@contenteditable='true']")).sendKeys(" Hello From Selenium  ");
        clickElement(By.xpath("//*[@id='dd_prop_value_0']//button[contains(@class,'fa fa-check')]"));
        textPresent("Hello From Selenium");
    }

    public void truncateRichText(String eltName, String status) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Rich Text')]"));
        hangon(1);
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Confirm')]"));
        hangon(1);
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='dd_prop_value_0']/div"));
    }

    public void truncatePlainText(String eltName, String status) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Plain Text')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Confirm')]"));
        hangon(1);
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        hangon(1);
        textNotPresent("More", By.xpath("//*[@id='dd_prop_value_0']/div"));
    }

    public void reorderPropertyTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "propertiesDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        showAllTabs();
        clickElement(By.id("properties_tab"));
        textPresent("Add Property");
        reorderIconTest(tabName);
        clickElement(By.xpath(prefix + "moveDown-0" + postfix));
        textPresent("pk1", By.xpath(prefix + "dd_name_1" + postfix));
        clickElement(By.xpath(prefix + "moveUp-2" + postfix));
        textPresent("pk3", By.xpath(prefix + "dd_name_1" + postfix));
        clickElement(By.xpath(prefix + "moveTop-2" + postfix));
        textPresent("pk1", By.xpath(prefix + "dd_name_0" + postfix));
    }
}
