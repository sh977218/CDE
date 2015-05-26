package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.annotations.Test;

public class PvValidatorTest extends BaseClassificationTest {

    public void addPv(int index, String pv) {
        addPv(index, pv, null, null);
    }

    public void addPv(int index, String pv, String name, String code) {
        findElement(By.id("addPv")).click();
        findElement(By.xpath("//td[@id='pv-" + index + "']//i")).click();
        findElement(By.xpath("//td[@id='pv-" + index + "']//input")).sendKeys(pv);
        findElement(By.cssSelector("#pv-" + index + " .fa-check")).click();

        if (name != null) {
            findElement(By.xpath("//td[@id='pvName-" + index + "']//i")).click();
            findElement(By.xpath("//td[@id='pvName-" + index + "']//input")).sendKeys(name);
            findElement(By.cssSelector("#pvName-" + index + " .fa-check")).click();
        }

        if (code != null) {
            findElement(By.xpath("//td[@id='pvCode-" + index + "']//i")).click();
            findElement(By.xpath("//td[@id='pvCode-" + index + "']//input")).sendKeys(code);
            findElement(By.cssSelector("#pvCode-" + index + " .fa-check")).click();
        }

    }

    public void changeField(String which, String to) {
        findElement(By.xpath("//td[@id='" + which +"']//i")).click();
        findElement(By.xpath("//td[@id='" + which +"']//input")).clear();
        findElement(By.xpath("//td[@id='" + which +"']//input")).sendKeys(to);
        findElement(By.cssSelector("#" + which + " .fa-check")).click();
    }

    @Test
    public void pvValidation() {
        mustBeLoggedInAs("selenium", password);
        createBasicCde("PvValidatorCde", "Def for PV Validator", "SeleniumOrg", "Test Classif", "Sub Classif");

        findElement(By.linkText("Permissible Values")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("editDatatype")));
        findElement(By.id("editDatatype")).click();
        new Select(findElement(By.id("valueTypeSelect"))).selectByVisibleText("Value List");

        addPv(0, "pv1", "name1", "code1");
        addPv(1, "pv2", "name2", "code2");
        addPv(2, "pv3");
        addPv(3, "pv4");

        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        changeField("pv-0", "pv2");
        textPresent("There are validation errors. Duplicate Permissible Value");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-1-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pv-1", "pv1");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        changeField("pvName-2", "name1");
        textPresent("There are validation errors. Duplicate Code Name");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-2-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pvName-2", "name3");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

        changeField("pvCode-3", "code2");
        textPresent("There are validation errors. Duplicate Code");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("pv-3-notValid")));
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("openSave")));

        changeField("pvCode-3", "code4");
        textNotPresent("There are validation errors");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("openSave")));

    }

}
