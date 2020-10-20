package gov.nih.nlm.form.test.datatypeTest;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class DateTypes extends NlmCdeBaseTest {

    @Test
    public void dateTypes() {
        mustBeLoggedInAs(nlm_username,nlm_password);
        goToFormByName("DateTypeTest");
        findElement(By.xpath("//div[@id='Person Birth Date_0-0']//input[@type='Number']"));
        findElement(By.xpath("//div[@id='Person Birth Date_0-1']//input[@type='month']"));
        findElement(By.xpath("//div[@id='Person Birth Date_0-2']//input[@type='date']"));
        findElement(By.xpath("//div[@id='Person Birth Date_0-3']//input[@type='datetime-local' and @step=3600]"));
        findElement(By.xpath("//div[@id='Person Birth Date_0-4']//input[@type='datetime-local']"));
        findElement(By.xpath("//div[@id='Person Birth Date_0-5']//input[@type='datetime-local' and @step=1]"));

        goToFormDescription();
        textPresent("Year", By.id("question_0-0"));
        textPresent("Month", By.id("question_0-1"));
        textNotPresent("Day", By.id("question_0-2"));
        textPresent("Hour", By.id("question_0-3"));
        textPresent("Minute", By.id("question_0-4"));
        textPresent("Second", By.id("question_0-5"));

    }

}
