package gov.nih.nlm.common.test;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;

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
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToEltByName(eltName, status);
        showAllTabs();
        //This is crazy broken. Fix it
        //Ok, so you  need to be logged in, and have an actual CDE with predefined properties and contexts (which can be made in a later test).

        /**
         * To redesign this method,  You have to have a preset list of properties. Then, you go to a board, create a couple of properties, check for conflict,
         * then delete and remake properties.
         *
         * To do that, we need another method (ideally, the method also runs tests itself, killing two birds with one stone) that logs in, and adds valid proerties and keys. Enquire about whether or not they'll be deleted after.
         *
         * Alernatively, we can have a "TEST ORG" that is primed with certain keys and values, and then we work with that.
         *
         * But, my concern is, that if a test that adds properties, that runs asychcronusly with the other tests, then we have a race condidtion.
         *
         * The way I see it, it'd be better for us to have a properties/contexts "MEGATEST" that has functions that cover everything that we want.
         *
         * One method that populates (and tests) the things that we want.
         *
         * Then, we test the various features and aspects of theis stuff for  CDES
         *
         */

        clickElement(By.id("properties_tab"));
        clickElement(By.id("addProperty"));
        clickElement(By.id("myProperty0"));
        findElement(By.name("value")).sendKeys("MyValue0");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("addProperty"));
        clickElement(By.id("myProperty1"));
        findElement(By.name("value")).sendKeys("MyValue1");
        clickElement(By.id("createProperty"));
        textPresent("Property Added");
        closeAlert();
        modalGone();

        clickElement(By.id("addProperty"));
        clickElement(By.id("myProperty2"));
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
        textPresent("myProperty0");
        textPresent("myProperty2");
        textPresent("MyValue0");
        textPresent("MyValue2");
        textNotPresent("myProperty1");
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
