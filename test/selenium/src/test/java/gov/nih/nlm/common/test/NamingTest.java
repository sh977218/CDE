package gov.nih.nlm.common.test;

import org.openqa.selenium.By;
import org.testng.Assert;

public abstract class NamingTest extends CommonTest {

    public void addRemoveEditTest() {
        mustBeLoggedInAs(cabigAdmin_username, password);
        String cdeName = "Principal Investigator State java.lang.String";
        String newName = "New Name";
        String newDefinition = "New Definition";
        String newNameChange = " Change";
        String newDefinitionChange = " Change";
        goToCdeByName(cdeName);
        clickElement(By.id("naming_tab"));

        addNewName(newName, newDefinition);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newName);

        editDesignationByIndex(1, newNameChange);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newName + newNameChange);

        editDefinitionByIndex(1, newDefinitionChange, false);
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent(newDefinition + newDefinitionChange);

        editTagByIndex(1, new String[]{"Health Changed"});
        newCdeVersion();

        clickElement(By.id("naming_tab"));
        textPresent("Health Changed");

        clickElement(By.id("removeNaming-1"));
        newCdeVersion();

        Assert.assertTrue(!findElement(By.cssSelector("BODY")).getText().contains("New Name"));
    }

    public void reorderNamingTest(String eltName) {
        setLowStatusesVisible();
        mustBeLoggedInAs(testAdmin_username, password);
        goToEltByName(eltName, null);
        String tabName = "namingDiv";
        String prefix = "//div[@id='" + tabName + "']//div//*[@id='";
        String postfix = "']";
        clickElement(By.linkText("Naming"));
        textPresent("Definition:");
        reorderIconTest(tabName);
        clickElement(By.xpath(prefix + "moveDown-0" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
        clickElement(By.xpath(prefix + "moveUp-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_1" + postfix)).getText().contains("cde for test cde reorder detail tabs 2"));
        clickElement(By.xpath(prefix + "moveTop-2" + postfix));
        Assert.assertTrue(findElement(By.xpath(prefix + "dd_name_0" + postfix)).getText().contains("cde for test cde reorder detail tabs"));
    }


}
