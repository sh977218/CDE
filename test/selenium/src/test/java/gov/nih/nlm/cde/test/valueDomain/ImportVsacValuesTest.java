package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ImportVsacValuesTest extends NlmCdeBaseTest {

    @Test
    public void importVsacValues() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Race Category");
        clickElement(By.id("pvs_tab"));
        textPresent("Native Hawaiian or other Pacific Islander");
        textNotPresent("Match");
        clickElement(By.id("removeAllPvs"));
        textNotPresent("Native Hawaiian or other Pacific Islander");
        clickElement(By.id("updateOID"));
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.836");
        clickElement(By.id("vsacIdCheck"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        clickElement(By.id("addVsacValue-0"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        clickElement(By.id("addAllVsac"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
//        scrollDownBy(50);
        findElement(By.id("pvRemove-2"));
        clickElement(By.id("pvRemove-0"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));

        newCdeVersion("Importing All VSAC Values");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
    }

}