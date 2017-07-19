package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class CopyrightTest extends BaseFormTest {

    @Test
    public void editCopyright() {
        String formName = "Quantitative Sensory Testing (QST)";
        String statement = "Never ever share this form";
        String authority = "Patent for truth";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        textNotPresent("Statement");
        textNotPresent("Authority");
        clickElement(By.id("isCopyrighted"));
        textPresent("Statement");
        textPresent("Authority");
        clickElement(By.cssSelector("#formCopyrightText .fa-edit"));
        findElement(By.cssSelector("#formCopyrightText input")).sendKeys(statement);
        clickElement(By.cssSelector("#formCopyrightText .fa-check"));
        clickElement(By.cssSelector("#formCopyrightAuthority .fa-edit"));
        findElement(By.cssSelector("#formCopyrightAuthority input")).sendKeys(authority);
        clickElement(By.cssSelector("#formCopyrightAuthority .fa-check"));
        newFormVersion();
        mustBeLoggedOut();
        goToFormByName(formName);
        textPresent("Statement");
        textPresent("Authority");
        textPresent(statement);
        textPresent(authority);
    }

}
