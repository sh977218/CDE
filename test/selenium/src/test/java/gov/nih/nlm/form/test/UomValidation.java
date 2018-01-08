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
        textPresent("inch", By.cssSelector(".questionUom"));
        textPresent("m", By.cssSelector(".questionUom"));
        textPresent("inches", By.id("question_0_3"));
        textPresent("(invalid)", By.id("question_0_3"));
        textPresent("cm", By.cssSelector(".questionUom"));
        textNotPresent("meter", By.cssSelector(".questionUom"));
        textNotPresent("meter", By.id("question_0_3"));
        textNotPresent("m", By.id("question_0_3"));

        startEditQuestionById("question_0_3");
        questionEditAddUom("question_0_3", "kilogram");
        saveEditQuestionById("question_0_3");
/*
        findElement(By.xpath("//*[contains(@class,'badge-danger')]//*[text()='kg']"));
        textNotPresent("kilogram");
*/

        goToPreview();
        findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).sendKeys("1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[1]"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).getAttribute("title"),"1.25");
        clickElement(By.xpath("(//div[@id='If Yes, what are the number of CAG repeats on the larger allele_3']//input[@name='q4_uom'])[2]"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_3_box']")).getAttribute("title"),"0.03175");
    }

}
