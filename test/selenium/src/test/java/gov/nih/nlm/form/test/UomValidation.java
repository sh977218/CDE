package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UomValidation extends BaseFormTest {

    @Test
    public void uomValidation() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("DNA Elements - Participant/Subject Information");
        goToFormDescription();
        textPresent("replaced with [in_i]");
        textPresent("meter");
        textPresent("replaced with m");
        textPresent("mean [in_i] (inch)");
        textPresent("m");
        textPresent("cm");

        startEditQuestionById("question_0-3");
        questionEditAddUom("question_0-3", "UCUM", "kilogram");
        questionEditAddUom("question_0-3", "Other", "Kilo");
        questionEditRemoveUom("question_0-3", "inches");
        saveEditQuestionById("question_0-3");
        textNotPresent("inches");
        findElement(By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[text()='UCUM/' and text()='kg']"));
        findElement(By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[text()='Kilo']"));

        goToPreview();
        findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).sendKeys("1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[1]"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).getAttribute("value"), "1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[2]"));
        wait.until(ExpectedConditions.attributeToBe(
                By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']"),
                "value",
                "0.03175"));

        clickElement(By.id("displayProfiles_tab"));
        createDisplayProfile(0, "Uom", true, true, true, true, "Follow-up", 1, false, 0);
        createDisplayProfile(1, "No Uom", true, true, true, true, "Follow-up", 1, false, 0);
        clickElement(By.cssSelector(".card .card-header"));
        new Select(findElement(By.xpath("//*[@id='profile_0']//*[@id='alias-UCUM-inch']/select"))).selectByVisibleText("international inch");

        goToPreview();
        textPresent("international inch");
        selectDisplayProfileByName("No Uom");
        textNotPresent("international inch");

        clickElement(By.id("openSave"));
        checkAlert("Please fix all errors before publishing");
        textPresent("errors need to be corrected");
        textPresent("Unit of Measure error on question \"If Yes, what are the number of CAG repeats on the larger allele\".");
        clickElement(By.partialLinkText("If Yes, what are the number of CAG repeats on the larger allele"));
        hangon(1);
        String scrollLocation = (((JavascriptExecutor) driver).executeScript("return window.pageYOffset", "")).toString();
        Assert.assertTrue(Double.valueOf(scrollLocation).intValue() > 100);
    }

}
