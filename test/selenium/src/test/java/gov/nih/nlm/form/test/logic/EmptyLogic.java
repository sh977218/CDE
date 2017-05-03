package gov.nih.nlm.form.test.logic;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.testng.annotations.Test;

public class EmptyLogic extends NlmCdeBaseTest {

    @Test
    public void emptyLogic() {
        goToFormByName("Empty Logic");

        textPresent("If empty:", By.xpath("//*[*[text()='Birth date']]"));
        textPresent("If none:", By.xpath("//*[*[text()='Image Acquisition Event Yes No Not Done Indicator']]"));
        textPresent("If empty:", By.xpath("//*[*[text()='Head injury prior number']]"));
        textPresent("If empty:", By.xpath("//*[*[text()='Noncompliant Reason Text']]"));

        clickElement(By.xpath("//label[contains(., 'Printable Logic:')]"));

        // Dates
        textPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).sendKeys("1");
        textPresent("Data unknown indicator");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).sendKeys("995");
        findElement(By.xpath("//div[@id='Birth date_0']//input")).sendKeys(Keys.TAB);
        textNotPresent("Data unknown indicator");

        // Value Lists
        textPresent("Pulmonary function test not done reason");
        findElement(By.xpath("//div[@id='Image Acquisition Event Yes No Not Done Indicator_2']//label/span[text()='No: C49487']")).click();
        textNotPresent("Pulmonary function test not done reason");

        // Numbers
        textPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_4']//input")).sendKeys("0");
        textNotPresent("Pulmonary function test not done other text");
        findElement(By.xpath("//div[@id='Head injury prior number_4']//input")).clear();
        textPresent("Pulmonary function test not done other text");

        // Text
        textPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).sendKeys("abc");
        textNotPresent("Perianal problem other text");
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).sendKeys(Keys.BACK_SPACE);
        findElement(By.xpath("//div[@id='Noncompliant Reason Text_6']//input")).sendKeys(Keys.BACK_SPACE);
        textPresent("Perianal problem other text");

    }

}
