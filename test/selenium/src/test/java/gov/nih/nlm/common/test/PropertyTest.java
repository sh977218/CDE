package gov.nih.nlm.common.test;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

public abstract class PropertyTest extends CommonTest {

    public void addRemoveProperty(String eltName, String status) {
        mustBeLoggedInAs("testAdmin", password);
        goToEltByName(eltName, status);
        showAllTabs();

        clickElement(By.id("properties_tab"));
        clickElement(By.id("addProperty"));
        new Select(findElement(By.id("newPropertyKey"))).selectByVisibleText("propKey0");
        findElement(By.name("value")).sendKeys("MyValue0");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("addProperty"));
        new Select(findElement(By.id("newPropertyKey"))).selectByVisibleText("propKey1");
        findElement(By.name("value")).sendKeys("MyValue1");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("addProperty"));
        new Select(findElement(By.id("newPropertyKey"))).selectByVisibleText("propKey2");
        findElement(By.name("value")).sendKeys("MyValue2");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("removeProperty-1"));
        clickElement(By.id("confirmRemoveProperty-1"));
        textPresent("Property Removed");
        closeAlert();

        goToEltByName(eltName, status);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        textPresent("propKey0");
        textPresent("propKey2");
        textPresent("MyValue0");
        textPresent("MyValue2");
        textNotPresent("propKey1");
        textNotPresent("MyValue1");
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

    public void truncateRichText(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Rich Text')]"));
        hangon(1);
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Confirm')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='dd_prop_value_0']/div"));
    }

    public void truncatePlainText(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);
        showAllTabs();
        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Plain Text')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::button[contains(text(),'Confirm')]"));
        clickElement(By.xpath("//*[@id='dd_prop_value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
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
