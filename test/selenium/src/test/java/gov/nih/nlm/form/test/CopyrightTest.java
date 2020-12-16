package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CopyrightTest extends BaseFormTest {

    @Test
    public void editCopyright() {
        String formName = "Quantitative Sensory Testing (QST)";
        String statement = "Never ever share this form";
        String authority = "Patent for truth";
        mustBeLoggedInAs(ninds_username, password);
        goToFormByName(formName);
        goToGeneralDetail();
        textNotPresent("Statement");
        textNotPresent("Authority");
        Assert.assertEquals(driver.findElements(By.id("copyrightStatement")).size(), 0);
        clickElement(By.id("isCopyrighted"));
        textPresent("Statement");
        textPresent("Authority");
        clickElement(By.xpath("//*[@id='formCopyrightText']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.cssSelector("#formCopyrightText input")).sendKeys(statement);
        clickElement(By.xpath("//*[@id='formCopyrightText']//mat-icon[normalize-space() = 'check']"));
        clickElement(By.xpath("//*[@id='formCopyrightAuthority']//mat-icon[normalize-space() = 'edit']"));
        findElement(By.cssSelector("#formCopyrightAuthority input")).sendKeys(authority);
        clickElement(By.xpath("//*[@id='formCopyrightAuthority']//mat-icon[normalize-space() = 'check']"));
        newFormVersion();
        logout();
        
        goToFormByName(formName);
        findElement(By.xpath("//small[@id='copyrightStatement' and contains(., '" + statement + "')]"));
        goToGeneralDetail();
        textPresent("Statement");
        textPresent("Authority");
        textPresent(statement);
        textPresent(authority);
    }

}
