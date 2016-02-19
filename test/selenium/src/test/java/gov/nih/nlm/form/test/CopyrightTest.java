package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CopyrightTest extends BaseFormTest {

    @Test
    public void editCopyright() {
        mustBeLoggedInAs(ninds_username, password);
        String formName = "Quantitative Sensory Testing (QST)";
        String statement = "Never ever share this form";
        String authority = "Patent for truth";
        driver.get(baseUrl + "/formView?tinyId=7ygDrkrStx");
        textPresent(formName);
        textNotPresent("Statement");
        textNotPresent("Authority");
        findElement(By.id("isCopyrighted")).click();
        textPresent("Statement");
        textPresent("Authority");
        findElement(By.cssSelector("#formCopyrightText .fa-edit")).click();
        findElement(By.cssSelector("#formCopyrightText input")).sendKeys(statement);
        findElement(By.cssSelector("#formCopyrightText .fa-check")).click();
        findElement(By.cssSelector("#formCopyrightAuthority .fa-edit")).click();
        findElement(By.cssSelector("#formCopyrightAuthority input")).sendKeys(authority);
        findElement(By.cssSelector("#formCopyrightAuthority .fa-check")).click();
        saveForm();
        mustBeLoggedOut();
        driver.get(baseUrl + "/formView?tinyId=7ygDrkrStx");
        textPresent("Statement");
        textPresent("Authority");
        textPresent(statement);
        textPresent(authority);
    }

}
