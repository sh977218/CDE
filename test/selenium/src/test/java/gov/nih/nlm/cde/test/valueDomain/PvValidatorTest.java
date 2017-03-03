package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PvValidatorTest extends BaseClassificationTest {

    public void addPv(String pv, String name, String code, String codeSystem) {
        clickElement(By.id("addPv"));
        findElement(By.id("permissibleValueInput")).sendKeys(pv);

        if (name != null) {
            findElement(By.id("valueMeaningNameInput")).sendKeys(name);
        }

        if (code != null) {
            findElement(By.id("valueMeaningCodeInput")).sendKeys(code);
        }

        if (codeSystem != null) {
            findElement(By.id("codeSystemInput")).sendKeys(codeSystem);
        }

        clickElement(By.id("createNewPv"));
    }

    public void changeField(String which, String to) {
        clickElement(By.xpath("//td[@id='" + which + "']//i"));
        findElement(By.xpath("//td[@id='" + which + "']//input")).clear();
        findElement(By.xpath("//td[@id='" + which + "']//input")).sendKeys(to);
        clickElement(By.cssSelector("#" + which + " .fa-check"));
    }

    @Test
    public void pvValidation() {
        mustBeLoggedInAs("selenium", password);
        goToCdeByName("PvValidatorCde");
        clickElement(By.id("pvs_tab"));
        textNotPresent("There are validation errors");

        changeField("pv-0", "pv2");
        textPresent("There are validation errors. Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pv-1", "pv1");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code5", "LOINC");
        textPresent("There are validation errors. Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code2", "NCi");
        textPresent("There are validation errors. Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        clickElement(By.id("addPv"));
        findElement(By.id("permissibleValueInput")).sendKeys("pv6");
        findElement(By.id("valueMeaningCodeInput")).sendKeys("code6");
        Assert.assertEquals(findElement(By.id("createNewPv")).isEnabled(), false);
        findElement(By.id("codeSystemInput")).sendKeys("MESH");
        Assert.assertEquals(findElement(By.id("createNewPv")).isEnabled(), true);
    }

}
