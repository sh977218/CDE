package gov.nih.nlm.cde.test;

import org.testng.annotations.Test;

public class TourDynamic extends TourBase {

    @Test
    public void takeDynamicTour() {
        goHome();
        checkTour();
    }

}
