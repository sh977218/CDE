package gov.nih.nlm.form.test;

import io.restassured.http.ContentType;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.get;
import static io.restassured.RestAssured.given;

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
        clickElement(By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionUom')]//" +
                "span[contains(@class,'badge badge-info') and contains(normalize-space(.),'inches')]/mat-icon"));
        saveEditQuestionById("question_0-3");
        textNotPresent("inches");
        findElement(By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[normalize-space()='UCUM/ kg']"));
        findElement(By.xpath("//*[@id='question_0-3']//*[contains(@class,'questionUom')]//*[normalize-space()='Kilo']"));

        goToPreview();
        hangon(1);
        findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']")).clear();
        findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']")).sendKeys("1.25");
        clickElement(By.xpath("//div[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3']//input[@name='0-3_uom_0']"));
        Assert.assertEquals(findElement(By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']")).getAttribute("value"), "1.25");
        clickElement(By.xpath("//div[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3']//input[@name='0-3_uom_1']"));
        wait.until(ExpectedConditions.attributeToBe(
                By.xpath("//input[@id='If Yes, what are the number of CAG repeats on the larger allele_0-3_box']"),
                "value",
                "0.03175"));

        clickElement(By.id("displayProfiles_tab"));
        createDisplayProfile(0, "Uom", true, true, true, true, "Follow-up", 1, false, 0);
        createDisplayProfile(1, "No Uom", true, true, true, true, "Follow-up", 1, false, 0);
        clickElement(By.xpath("//*[@id='profile_0']//button[contains(.,'Edit')]"));
        new Select(findElement(By.xpath("//*[@id='profile_0']//*[@id='alias-UCUM-inch']/select"))).selectByVisibleText("international inch");

        goToPreview();
        textPresent("international inch");
        selectDisplayProfileByName("No Uom");
        textNotPresent("international inch");

        textPresent("The following errors need to be corrected in order to Publish");
        textPresent("Unit of Measure error on question \"If Yes, what are the number of CAG repeats on the larger allele\".");

        clickElement(By.id("openSave"));
        checkAlert("Please fix all errors before publishing");
        textPresent("errors need to be corrected");
        clickElement(By.partialLinkText("If Yes, what are the number of CAG repeats on the larger allele"));
        hangon(1);
        String scrollLocation = (((JavascriptExecutor) driver).executeScript("return window.pageYOffset", "")).toString();
        Assert.assertTrue(Double.valueOf(scrollLocation).intValue() > 100);
    }

    @Test
    public void ucumErrors() {
        String resp = get(baseUrl + "/server/ucumSynonyms?uom=kgg").asString();
        Assert.assertEquals(resp, "[]");

        resp = given().contentType(ContentType.JSON).body("{\"uoms\": [\"psi\"]}").post(baseUrl + "/server/ucumValidate").asString();
        Assert.assertTrue(resp.contains("Unit is not found. Did you mean pound per square inch?"),
                "actually: " + resp);

        resp = given().contentType(ContentType.JSON)
                .body("{\"uoms\": [\"meters\"]}").post(baseUrl + "/server/ucumValidate").asString();
        Assert.assertTrue(resp.contains("Unit is not found. Did you mean m (meter)?"),
                "actually: " + resp);

        resp = given().contentType(ContentType.JSON)
                .body("{\"uoms\": [\"mets\"]}").post(baseUrl + "/server/ucumValidate").asString();
        Assert.assertTrue(resp.contains("mets is not a valid UCUM code.  No alternatives were found"),
                "actually: " + resp);

        resp = get(baseUrl + "/server/ucumConvert?value=0&to=0&from=0").asString();
        Assert.assertEquals(resp, "",
                "actually: " + resp);
    }

}
