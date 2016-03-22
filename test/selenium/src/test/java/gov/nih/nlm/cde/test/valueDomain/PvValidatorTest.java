package gov.nih.nlm.cde.test.valueDomain;

import gov.nih.nlm.cde.test.BaseClassificationTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class PvValidatorTest extends BaseClassificationTest {

    public void addPv(String pv) {
        addPv(pv, null, null);
    }

    public void addPv(String pv, String name, String code) {
        addPv(pv, name, code, null);
    }

    public void addPv(String pv, String name, String code, String codeSystem) {
        findElement(By.id("addPv")).click();
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
        findElement(By.xpath("//td[@id='" + which + "']//i")).click();
        findElement(By.xpath("//td[@id='" + which + "']//input")).clear();
        findElement(By.xpath("//td[@id='" + which + "']//input")).sendKeys(to);
        findElement(By.cssSelector("#" + which + " .fa-check")).click();
    }

    @Test
    public void pvValidation() {
        mustBeLoggedInAs("selenium", password);
        createBasicCde("PvValidatorCde", "Def for PV Validator", "SeleniumOrg", "Test Classif", "Sub Classif");

        clickElement(By.linkText("Permissible Values"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        clickElement(By.id("editDatatype"));
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Value List");

        addPv("pv1", "name1", "code1");
        addPv("pv2", "name2", "code2");
        addPv("pv3");
        addPv("pv4");

        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        changeField("pv-0", "pv2");
        textPresent("There are validation errors. Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pv-1", "pv1");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code5");
        textPresent("There are validation errors. Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        addPv("pv5", "name1", "code2");
        textPresent("There are validation errors. Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-4-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));
        clickElement(By.id("pvRemove-4"));
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

    }

}
