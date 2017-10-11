package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CdeSwaggerTest extends NlmCdeBaseTest {

    @Test
    public void cdeTinyIdSwaggerApi() {
        swaggerApi("cdeTinyId", "PHQ9IntrstPleasrActScore", "QkWPURx5Fz", null);
    }

    @Test
    public void cdeTinyIdVersionSwaggerApi() {
        swaggerApi("cdeTinyIdVersion", "cde for test cde reorder detail tabs definition", "7yl__aTQOe", "1.0");
    }
}
