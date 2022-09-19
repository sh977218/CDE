package gov.nih.nlm.cde.test.score;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.testng.annotations.Test;

public class CannotScoreAsAnon extends NlmCdeBaseTest {

    @Test
    public void cannotScoreAsAnonymous() {
        goToCdeByName("Head and Neck Lymph Node Left Removed Type");

        textNotPresent("Add Score");
    }

}
