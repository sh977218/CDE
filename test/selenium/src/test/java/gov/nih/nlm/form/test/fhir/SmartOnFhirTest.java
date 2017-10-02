package gov.nih.nlm.form.test.fhir;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SmartOnFhirTest extends NlmCdeBaseTest {

//    @Test
//    public void smartHealthIt() {
//        driver.get("https://sandbox.smarthealthit.org/smartstu3/#/manage-apps");
//        findElement(By.id("username")).clear();
//        findElement(By.id("username")).sendKeys("georgi.ivanov@nih.gov");
//        hangon(1);
//        findElement(By.id("password")).clear();
//        findElement(By.id("password")).sendKeys(")G*jn");
//        hangon(1);
//        clickElement(By.id("submitButton"));
//
//        textPresent("Registered Apps");
//        clickElement(By.linkText("DEV"));
//        clickElement(By.xpath("//div[contains(@class,'btn-md') and contains(.,'Launch')]/i[contains(@class,'fa-external-link')]"));
//        textPresent("Choose a Patient");
//        hangon(1);
//        findElement(By.id("patient-search")).sendKeys("Abb");
//        hangon(1);
//        clickElement(By.xpath("//*[text()='Abbott, Thaddeus']"));
//
//        switchTab(1);
//        hangon(5);
//        if (driver.findElements(By.xpath("//h1[contains(text(),'Approval Required for')]")).size() > 0) // By.cssSelector("form[name='confirmationForm']")
//            clickElement(By.cssSelector("input.btn-success"));
//
//        textPresent("Patient:");
//        textPresent("Abbott, Thaddeus");
//        textPresent("1935-12-16");
//        textPresent("male");
//        textPresent("Outpatient Encounter");
//        clickElement(By.linkText("2007-10-06T22:39:12-04:00"));
//        textPresent("Outpatient Encounter - 2007-10-06T22:39:12-04:00");
//        clickElement(By.xpath("//button[contains(text(), 'FHIR: Vital Signs')]//div[text()='4 / 4']"));
//        textPresent("Date and Time");
//        findElement(By.xpath("//input[@title='2007-10-06T22:39:12-04:00' and @disabled]"));
//        findElement(By.cssSelector("ngb-timepicker"));
//        int low = Integer.parseInt(findElement(By.id("Diastolic blood pressure_1_box")).getText());
//        Assert.assertTrue(low > 0);
//        low = low - 1;
//        findElement(By.id("Diastolic blood pressure_1_box")).sendKeys(Integer.toString(low));
//        clickElement(By.id("button_submit"));
//        hangon(2);
//        int newLow = Integer.parseInt(findElement(By.id("Diastolic blood pressure_1_box")).getText());
//        Assert.assertEquals(low, newLow);
//
//        clickElement(By.xpath("//button[contains(., 'Encounter')]"));
//        clickElement(By.xpath("//button[contains(., 'Add')]"));
//        findElement(By.xpath("//input[@type='text' and not(@disabled)]")).sendKeys(current time);
//        // TODO: new new encounter with observations, launch app again to verify
//    }

}
