package gov.nih.nlm.form.test.datatype;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DateTypes extends NlmCdeBaseTest {

    @Test
    public void dateTypes() {
        goToFormByName("DateTypeTest");
        findElement(By.xpath("//div[@id='Person Birth Date_0']//input[@type='Number']"));
        findElement(By.xpath("//div[@id='Person Birth Date_1']//input[@type='month']"));
        findElement(By.xpath("//div[@id='Person Birth Date_2']//input[@type='date']"));
        findElement(By.xpath("//div[@id='Person Birth Date_3']//input[@type='datetime-local' and @step=3600]"));
        findElement(By.xpath("//div[@id='Person Birth Date_4']//input[@type='datetime-local'"));
        findElement(By.xpath("//div[@id='Person Birth Date_5']//input[@type='datetime-local' and @step=1]"));

        goToFormDescription();
        textPresent("Year", By.id("question_0_0"));
        textPresent("Month", By.id("question_0_1"));
        textNotPresent("Day", By.id("question_0_2"));
        textPresent("Hour", By.id("question_0_3"));
        textPresent("Minute", By.id("question_0_4"));
        textPresent("Second", By.id("question_0_5"));

    }

}
