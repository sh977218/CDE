package gov.nih.nlm.form.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class NativeTableTest extends BaseFormTest {

    @Test
    public void test() {
        mustBeLoggedInAs(nlm_username, nlm_password);
        String formName = "Form Table Test";
        goToFormByName(formName);

        textPresent("Patient Family Member Order Name", By.xpath("//cde-native-table//thead//th"));
        textPresent("Condition", By.xpath("//cde-native-table//thead//th"));
        textPresent("Education level", By.xpath("//cde-native-table//thead//th"));
        textPresent("2.", By.xpath("//[@class='native-table-cell']/label"));
        textPresent("1st Grade", By.xpath("//[@class='native-table-cell']/label/span"));

        clickElement(By.id("description_tab"));


    }
}
