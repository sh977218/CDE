package gov.nih.nlm.common.test;

import org.openqa.selenium.By;

public abstract class PropertyTest extends CommonTest {

    public void addRemoveProperty(String eltName, String status) {
        String key0 = "propKey0";
        String value0 = "MyValue0";
        String key1 = "propKey1";
        String value1 = "MyValue1";
        String key2 = "propKey2";
        String value2 = "MyValue2";

        mustBeLoggedInAs("testAdmin", password);
        goToEltByName(eltName, status);

        clickElement(By.id("properties_tab"));

        addNewProperty(key0, value0);
        addNewProperty(key1, value1);
        addNewProperty(key2, value2);

        clickElement(By.id("removeProperty-1"));
        clickElement(By.id("confirmRemoveProperty-1"));
        textPresent("Property Removed");
        closeAlert();

        goToEltByName(eltName, status);

        clickElement(By.id("properties_tab"));
        textPresent(key0);
        textPresent(value0);
        textNotPresent(key1);
        textNotPresent(value1);
        textPresent(key2);
        textPresent(value2);
    }

    public void truncateRichText(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);

        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='value_2']//i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='value_2']//button[contains(text(),'Rich Text')]"));
        hangon(1);
        clickElement(By.xpath("//*[@id='value_2']//button[contains(text(),'Confirm')]"));

        textPresent("Saved");
        closeAlert();

        scrollToViewById("openNewPropertyModalBtn");
        clickElement(By.xpath("//*[@id='value_2']/descendant::span[text()='More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='value_2']"));
    }

    public void truncatePlainText(String eltName) {
        mustBeLoggedInAs(ninds_username, password);
        goToEltByName(eltName, null);

        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='value_2']/d/i[contains(@class,'fa fa-edit')]"));
        clickElement(By.xpath("//*[@id='value_2']//button[contains(text(),'Plain Text')]"));
        clickElement(By.xpath("//*[@id='value_2']//:button[contains(text(),'Confirm')]"));

        clickElement(By.id("properties_tab"));
        clickElement(By.xpath("//*[@id='value_2']//span[. = 'More']"));
        textPresent("516-543, DOI:10.1002/jmri.22259");
        textNotPresent("More", By.xpath("//*[@id='value_2']"));
    }

    public void reorderPropertyTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        clickElement(By.id("properties_tab"));

        clickElement(By.xpath("//*[@id='moveDown-0']"));
        textPresent("pk1", By.xpath("//div//*[@id='key_1']"));
        clickElement(By.xpath("//*[@id='moveUp-2']"));
        textPresent("pk3", By.xpath("//div//*[@id='key_1']"));
        clickElement(By.xpath("//*[@id='moveTop-2']"));
        textPresent("pk1", By.xpath("//*[@id='key_0']"));
    }
}
