package gov.nih.nlm.form.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class FormSwaggerTest extends NlmCdeBaseTest {

    @Test
    public void formTinyIdSwaggerApi() {
        swaggerApi("formTinyId", "Undifferentiated/Indeterminant/Intersex", "Xy1kuxJqm", null);
    }

    @Test
    public void formTinyIdVersionSwaggerApi() {
        swaggerApi("formTinyIdVersion", "Form Retire Test", "43fdfdfsdfs", "1.1");
    }
}
