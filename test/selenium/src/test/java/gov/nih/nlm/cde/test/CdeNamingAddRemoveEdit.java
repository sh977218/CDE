package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.RecordVideo;
import org.testng.annotations.Test;

public class CdeNamingAddRemoveEdit extends CdeNamingTest {

    @Test
    @RecordVideo
    public void addRemoveEdit() {
        addRemoveEditTest();
    }

}
