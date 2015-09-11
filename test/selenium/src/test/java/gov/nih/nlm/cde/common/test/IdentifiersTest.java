package gov.nih.nlm.cde.common.test;

import gov.nih.nlm.common.test.CommonTest;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

public abstract class IdentifiersTest extends CommonTest {

    protected void addId(String source, String id, String version) {
        findElement(By.linkText("Identifiers")).click();
        findElement(By.id("addId")).click();
        findElement(By.name("source")).sendKeys(source);
        findElement(By.name("id")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        findElement(By.id("createId")).click();
        textPresent("Identifier Added");
        closeAlert();
        hangon(1);
    }

    public void addRemoveId(String eltName, String status) {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToEltByName(eltName, status);
        addId("MyOrigin1", "MyId1", "MyVersion1");
        scrollToTop();
        addId("MyOrigin2", "MyId2", null);
        scrollToTop();
        addId("MyOrigin3", "MyId3", "MyVersion3");

        //remove MyOrigin2
        List<WebElement> ddElts = driver.findElements(By.xpath("//dd[starts-with(@id, 'dd_id_origin')]"));
        for (int i = 0; i < ddElts.size(); i++) {
            if (ddElts.get(i).getText().equals("MyOrigin2")) {
                findElement(By.id("removeId-" + i)).click();
                findElement(By.id("confirmRemoveId-" + i)).click();
                Assert.assertTrue(textPresent("Identifier Removed"));
                closeAlert();
                i = ddElts.size();
            }
        }

        goToEltByName(eltName, status);
        findElement(By.linkText("Identifiers")).click();
        textPresent("MyOrigin1");
        textPresent("MyId1");
        textPresent("MyVersion1");
        textPresent("MyOrigin3");
        textPresent("MyId3");
        textPresent("MyVersion3");
        textNotPresent("MyOrigin2");
        textNotPresent("MyId2");
    }


}
