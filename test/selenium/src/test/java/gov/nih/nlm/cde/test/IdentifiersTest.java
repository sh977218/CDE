
package gov.nih.nlm.cde.test;

import static gov.nih.nlm.cde.test.NlmCdeBaseTest.ctepCurator_username;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class IdentifiersTest extends NlmCdeBaseTest {

    @Test
    public void addRemoveId() {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        String cdeName = "Intravesical Protocol Agent Administered Specify";
        goToCdeByName(cdeName);
        findElement(By.linkText("Identifiers")).click();
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("origin")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        modalGone();
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("origin")).sendKeys("MyOrigin2");
        findElement(By.name("id")).sendKeys("MyId2");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        hangon(2.5);
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("origin")).sendKeys("MyOrigin3");
        findElement(By.name("id")).sendKeys("MyId3");
        findElement(By.name("version")).sendKeys("MyVersion3");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        modalGone();

        findElement(By.id("removeId-2")).click();
        findElement(By.id("confirmRemoveId-2")).click();
        Assert.assertTrue(textPresent("Identifier Removed"));
        
        goToCdeByName(cdeName);
        findElement(By.linkText("Identifiers")).click();
        Assert.assertTrue(textPresent("MyOrigin1"));
        Assert.assertTrue(textPresent("MyId1"));
        Assert.assertTrue(textPresent("MyVersion1"));
        Assert.assertTrue(textPresent("MyOrigin3"));
        Assert.assertTrue(textPresent("MyId3"));
        Assert.assertTrue(textPresent("MyVersion3"));
        Assert.assertTrue(textNotPresent("MyOrigin2"));
        Assert.assertTrue(textNotPresent("MyId2"));
        
    }
        
    
}
