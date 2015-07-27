package gov.nih.nlm.cde.test;

import org.openqa.selenium.By;
import org.testng.annotations.Test;

public class ListTourTest extends TourTest {

    @Test
    public void listTour() {
        String[] tourInfo = {
                "Welcome to the NIH CDE Repository. This tour will guide through through the application. If you close this tour, you can restart it here. Different sections of the applications have different help sections.",
                "This menu will take you back to the CDE search page",
                "This menu will take you to the Form search page",
                "Boards allow registered users to group CDEs. Boards can be private or public. Boards are persistent and will not disappear unless you remove them.",
                "The quick board is is a volatile board for doing quick comparisons or CDE downloads. The quick board is emptied when the page is refreshed.",
                "Here's where you can find more documentation about this site or start this tour again.",
                "Personalize your search results. Include more registration statuses or configure how results are shown.",
                "Enter one or more search terms. For example, search for \"Ethnicity\".",
                "This is your search result. It will show a combination of most relevant and higher status CDEs first.",
                "Click the accordion to view the CDE summary",
                "Click the eye to see the full detail of this data element",
                "The plus sign will add a CDE to your Quick Board.",
                "The grid view shows all search results (max 1000) in a single page. From there, results can be downloaded in CSV format.",
                "If your screen is small and the filters on the left end bother you, you can hide them here.",
                "Navigate the classification tree to filter results by context, domain, or other type of data element classification or grouping.",
                "You can add a second classification restriction by clicking this plus sign.",
                "See which filter are applied to your query", "Restrict search to one or more statuses here.",
                "If you experience technical issues with the website you can report them here."
        };
        mustBeLoggedOut();
        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        hangon(1);
        findElement(By.linkText("Help")).click();
        findElement(By.linkText("Take a tour")).click();
        textPresent(tourInfo[0]);
        for (int i = 1; i < tourInfo.length; i++) {
            getNext(tourInfo[i]);
            System.out.println("i:" + i);
        }
        findElement(By.xpath("//button[@data-role='end']")).click();
    }

}
