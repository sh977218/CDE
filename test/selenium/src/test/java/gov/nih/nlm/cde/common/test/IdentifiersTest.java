package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.cde.test.NlmCdeBaseTest;
import java.util.List;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public abstract class IdentifiersTest extends NlmCdeBaseTest {

    public abstract void goToEltByName(String name);
    
    public void addRemoveId(String eltName) {
        mustBeLoggedInAs(ctepCurator_username, ctepCurator_password);
        goToEltByName(eltName);
        findElement(By.linkText("Identifiers")).click();
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("source")).sendKeys("MyOrigin1");
        findElement(By.name("id")).sendKeys("MyId1");
        findElement(By.name("version")).sendKeys("MyVersion1");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        modalGone();
        
        scrollTo( "2000" );
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("source")).sendKeys("MyOrigin2");
        findElement(By.name("id")).sendKeys("MyId2");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        modalGone();
        
        scrollTo( "2000" );
        findElement(By.id("addId")).click();
        modalHere();
        findElement(By.name("source")).sendKeys("MyOrigin3");
        findElement(By.name("id")).sendKeys("MyId3");
        findElement(By.name("version")).sendKeys("MyVersion3");
        findElement(By.id("createId")).click();
        Assert.assertTrue(textPresent("Identifier Added"));
        modalGone();

        //remove MyOrigin2
        List<WebElement> ddElts = driver.findElements(By.xpath("//dd[starts-with(@id, 'dd_id_origin')]"));
        for (int i = 0; i < ddElts.size(); i++) {
            if (ddElts.get(i).getText().equals("MyOrigin2")) {
                findElement(By.id("removeId-" + i)).click();
                findElement(By.id("confirmRemoveId-" + i)).click();
                Assert.assertTrue(textPresent("Identifier Removed"));
                i = ddElts.size();
            }
        }
        
        goToEltByName(eltName);
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
