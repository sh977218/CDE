package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.annotations.Test;

public class ImportVsacValues extends NlmCdeBaseTest {

    @Test
    public void importVsacValues() {
        mustBeLoggedInAs(ctepCurator_username, password);
        goToCdeByName("Patient Race Category");
        findElement(By.linkText("Permissible Values")).click();
        textPresent("Native Hawaiian or other Pacific Islander");
        textNotPresent("Match");
        findElement(By.id("removeAllPvs")).click();
        textNotPresent("Native Hawaiian or other Pacific Islander");
        findElement(By.linkText("Update O.I.D")).click();
        findElement(By.name("vsacId")).sendKeys("2.16.840.1.114222.4.11.836");
        findElement(By.id("vsacIdCheck")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        findElement(By.id("addVsacValue-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-valid")));
        findElement(By.id("addAllVsac")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
        findElement(By.id("pvRemove-0")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));

        newCdeVersion("Importing All VSAC Values");

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-0-warning")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-1-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-2-valid")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("vset-3-valid")));
    }

}