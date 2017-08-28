package gov.nih.nlm.common.test;

import org.openqa.selenium.By;

public abstract class IdentifiersTest extends CommonTest {

    protected void addId(String source, String id, String version) {
        clickElement(By.id("ids_tab"));
        clickElement(By.id("openNewIdentifierModalBtn"));
        findElement(By.id("newSource")).sendKeys(source);
        findElement(By.id("newId")).sendKeys(id);
        if (version != null)
            findElement(By.name("version")).sendKeys(version);
        clickElement(By.id("createNewIdentifierBtn"));
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
        clickElement(By.id("removeIdentifier-2"));
        clickElement(By.id("confirmRemoveIdentifier-2"));

        goToEltByName(eltName, status);

        clickElement(By.id("ids_tab"));
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
