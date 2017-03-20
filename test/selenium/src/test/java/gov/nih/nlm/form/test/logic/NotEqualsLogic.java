package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.form.test.BaseFormTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class NotEqualsLogic extends BaseFormTest {

    @Test
    public void NotEqualsLogic() {
        goToFormByName("Not Equals Test");
        clickElement(By.xpath("//label[contains(., 'Printable Logic')]"));

        // test numbers
        textPresent("Spinal surgery indicator");
        findElement(By.name("q1")).sendKeys("1");
        textPresent("Spinal surgery indicator");
        findElement(By.name("q1")).sendKeys("11");
        textNotPresent("Spinal surgery indicator");

        scrollDownBy(500);

        // test date
        textPresent("Diagnosis age type");
        findElement(By.name("q3")).sendKeys("2015-01-02");
        textPresent("Diagnosis age type");
        findElement(By.name("q3")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("q3")).sendKeys("1" + Keys.TAB);
        textNotPresent("Diagnosis age type");

        // text and empty logic
        textPresent("Birth Weight");
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");
        findElement(By.name("q5")).sendKeys("Swe");
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");
        textPresent("Birth Weight");
        findElement(By.name("q5")).sendKeys("den");
        textNotPresent("Birth Weight");
        findElement(By.name("q5")).sendKeys(Keys.BACK_SPACE);
        findElement(By.name("q5")).clear();
        textPresent("Scale for the Assessment of Positive Symptoms (SAPS) - incoherence word salad schizophasia scale");

        // value list
        textPresent("Quality of Life - Stigma illness recent assessment scale");
        clickElement(By.xpath("//input[@name='q7' and @value='5']"));
        textNotPresent("Quality of Life - Stigma illness recent assessment scale");

    }

}
