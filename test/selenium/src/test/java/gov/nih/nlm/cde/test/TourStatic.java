package gov.nih.nlm.cde.test;

import org.testng.annotations.Test;

public class TourStatic extends TourBase {

    @Test
    public void takeStaticTour() {
        goHomeStatic();
        checkTour();
    }


}
