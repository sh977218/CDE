
package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.Select;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;


public class MoreLikeThisTest extends NlmCdeBaseTest {
    @DataProvider(name = "moreLikeThisDP")
    public Object[][] getMoreLikeThisData() {
        return new Object[][]{
                {"Patient Gender Category", new String[]{"Person Gender Text Type", "Patient Gender Code"}},
                {"Induced Mutation Site Begin java.lang.Integer",
                        new String[]{"Therapeutic Procedure First Course Radiation Therapy Begin Date java.lang.String",
                                "Protein Molecular Modeling Database Relationship Protein Begin java.lang.Long"}},
        };
    }

    @Test(dataProvider = "moreLikeThisDP")
    public void moreLikeThis(String cdeSource, String[] cdeTargets) {
        goToCdeByName(cdeSource);
        showAllTabs();
        clickElement(By.id("mlt_tab"));
        for (String tCde : cdeTargets) {
            textPresent(tCde);
        }
    }

}
