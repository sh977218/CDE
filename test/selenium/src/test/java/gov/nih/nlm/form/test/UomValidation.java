package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class UomValidation extends BaseFormTest {

    @Test
    public void uomValidation() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        goToFormByName("DNA Elements - Participant/Subject Information");
        goToFormDescription();
        textPresent("[in_i]", By.cssSelector(".questionUom"));
        textPresent("m", By.cssSelector(".questionUom"));
        textPresent("inches", By.cssSelector(".badge-danger"));
        textPresent("(invalid)", By.cssSelector(".badge-danger"));
        textPresent("cm", By.cssSelector(".questionUom"));
        textNotPresent("meter", By.cssSelector(".questionUom"));
        textNotPresent("meter", By.cssSelector(".badge-danger"));
        textNotPresent("m", By.cssSelector(".badge-danger"));

        startEditQuestionSectionById("question_0_3");
        questionEditAddUom("question_0_3", "kilogram");
        saveEditQuestionSectionById("question_0_3");
        findElement(By.xpath("//*[contains(@class,'badge-danger')]//*[text()='kg']"));
        textNotPresent("kilogram");

        goToPreview();
        findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).sendKeys("1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[1]"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).getAttribute("title"),"1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[2]"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).getAttribute("title"),"0.03175");
    }

}
