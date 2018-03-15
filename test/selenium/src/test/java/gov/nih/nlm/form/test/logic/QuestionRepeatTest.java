package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class QuestionRepeatTest extends BaseFormTest {

    @Test
    public void questionRepeat() {
        mustBeLoggedInAs(testAdmin_username, password);
        String formName = "Question Repeat";
        goToFormByName(formName);
        textNotPresent("If 1: DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0']"));
        textPresent("If 1: DCE-MRI Kinetics T1 Mapping Quality Type", By.xpath("//*[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_1']"));
        textNotPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='Neoadjuvant Therapy_0']"));
        textPresent("Tumor T1 Signal Intensity Category", By.xpath("//*[@id='Neoadjuvant Therapy_1']"));

        togglePrintableLogic();
        textNotPresent("DCE-MRI Kinetics T1 Mapping Quality Type");
        textNotPresent("Tumor T1 Signal Intensity Category");

        findElement(By.xpath("//input[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_0_box']")).sendKeys("1");
        textNotPresent("DCE-MRI Kinetics T1 Mapping Quality Type");
        findElement(By.xpath("//input[@id='Visible Tumor Anterior-Posterior Orientation Size 3 Digit Number_1_box']")).sendKeys("1");
        textPresent("DCE-MRI Kinetics T1 Mapping Quality Type");

        clickElement(By.xpath("//*[@id='Neoadjuvant Therapy_0']//label[contains(., 'Yes')]"));
        textNotPresent("Tumor T1 Signal Intensity Category");
        clickElement(By.xpath("//*[@id='Neoadjuvant Therapy_1']//label[contains(., 'Yes')]"));
        textPresent("Tumor T1 Signal Intensity Category");
    }

}
