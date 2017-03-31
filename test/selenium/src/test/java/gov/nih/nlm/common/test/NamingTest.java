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

        addNewName(newName, newDefinition, null);
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
        clickElement(By.id("naming_tab"));
        clickElement(By.xpath("//div[@id='moveDown-0']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='designation_1']")).getText().contains("cde for test cde reorder detail tabs"));
        clickElement(By.xpath("//div[@id='moveUp-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='designation_1']")).getText().contains("cde for test cde reorder detail tabs 2"));
        clickElement(By.xpath("//div[@id='moveTop-2']"));
        Assert.assertTrue(findElement(By.xpath("//div[@id='designation_0']")).getText().contains("cde for test cde reorder detail tabs"));
    }


}
