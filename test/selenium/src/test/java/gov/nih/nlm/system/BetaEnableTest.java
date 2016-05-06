package gov.nih.nlm.system;

import org.testng.annotations.Test;

public class BetaEnableTest extends NlmCdeBaseTest {

    @Test
    public void enableDisableBetaFeatureTest() {
        goHome();
        enableBetaFeature();
    }

}
