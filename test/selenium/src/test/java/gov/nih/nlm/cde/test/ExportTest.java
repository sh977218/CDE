package gov.nih.nlm.cde.test;

import gov.nih.nlm.system.NlmCdeBaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.FileNotFoundException;
import java.util.concurrent.TimeUnit;

import static com.jayway.restassured.RestAssured.given;

public class ExportTest extends NlmCdeBaseTest {

    @Test
    public void searchExport() {
        String query = "{\n" +
                "\t\"resultPerPage\" : 20,\n" +
                "\t\"selectedOrg\" : \"AECC\",\n" +
                "\t\"selectedElements\" : [],\n" +
                "\t\"selectedElementsAlt\" : [],\n" +
                "\t\"includeAggregations\" : true,\n" +
                "\t\"selectedStatuses\" : [\"Preferred Standard\", \"Standard\", \"Qualified\", \"Recorded\", \"Candidate\", \"Incomplete\"],\n" +
                "\t\"visibleStatuses\" : [\"Preferred Standard\", \"Standard\", \"Qualified\", \"Recorded\", \"Candidate\", \"Incomplete\"],\n" +
                "\t\"searchToken\" : \"id7e19889e\"\n" +
                "}\n";

        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde?type=csv").asString();//.then().assertThat().contentType(ContentType.JSON);

        Assert.assertTrue(response.contains("\"Ethnic Group Category Text\",\"Ethnicity; Patient Ethnicity; Ethnicity; Newborn's Ethnicity\",\"Value List\",\"Not Hispanic or Latino; Hispanic or Latino; Unknown; Not reported\",\"caDSR: 2192217 v2\",\"caBIG\",\"Standard\",\"\",\"NIDCR; caBIG; CCR; CTEP; NICHD; AECC; LCC; USC/NCCC; NHC-NCI; PBTC; CITN; OHSU Knight; DCP; DCI; Training\","));

        goToCdeSearch();
        findElement(By.id("browseOrg-NINDS")).click();
        textPresent("All Statuses");
        findElement(By.id("ftsearch-input")).sendKeys("\"Parkinson's\"");
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");
    }

    @Test
    public void quickBoardExport() {
        goToSearch("cde");
        findElement(By.id("browseOrg-caBIG")).click();
        hangon(1);
        findElement(By.id("addToCompare_0")).click();
        findElement(By.id("addToCompare_1")).click();
        findElement(By.id("addToCompare_2")).click();
        findElement(By.id("addToCompare_3")).click();
        findElement(By.id("addToCompare_4")).click();
        findElement(By.id("addToCompare_5")).click();
        findElement(By.id("addToCompare_6")).click();

        textPresent("Quick Board ( 7 )");
        goToQuickBoard();

        textPresent("Export Quick Board");

        findElement(By.id("qb.export")).click();
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        closeAlert();
        findElement(By.id("qb.empty")).click();
        if (!done) throw new TimeoutException("Export was too slow.");
    }

    @Test
    public void allExport() throws FileNotFoundException {
        String query = "{\"resultPerPage\":20,\"selectedElements\":[],\"selectedElementsAlt\":[],\"includeAggregations\":true,\"selectedStatuses\":[\"Preferred Standard\",\"Standard\",\"Qualified\",\"Recorded\",\"Candidate\",\"Incomplete\"],\"visibleStatuses\":[\"Preferred Standard\",\"Standard\",\"Qualified\",\"Recorded\",\"Candidate\",\"Incomplete\"]}";

        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde?type=csv").asString();//.then().assertThat().contentType(ContentType.JSON);
        Assert.assertTrue(response.contains("\"Substance Administration Intervention or Procedure Performed Study Activity Negation Occurrence Reason ISO21090.DSET.SC.v1.0\",\"\",\"ISO21090DSETv1.0\",\"\",\"caDSR: 3177152 v1\",\"caBIG\",\"Qualified\",\"\",\"caBIG\""));
        goToCdeSearch();

        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        findElement(By.id("export")).click();
        findElement(By.id("csvExport")).click();
        textPresent("export is being generated");
        closeAlert();
        textPresent("server is busy processing");
        closeAlert();
        boolean done = false;
        for (int i = 0; !done && i < 15; i++) {
            try {
                textPresent("Export downloaded.");
                done = true;
            } catch (TimeoutException e) {
                System.out.println("No export after : " + 10 * i + "seconds");
            }
        }
        closeAlert();
        if (!done) throw new TimeoutException("Export was too slow.");
    }

    @Test
    public void allXmlExport(){
        String query = "{\"resultPerPage\":20,\"selectedElements\":[],\"selectedElementsAlt\":[],\"includeAggregations\":true,\"selectedStatuses\":[\"Preferred Standard\",\"Standard\",\"Qualified\",\"Recorded\",\"Candidate\",\"Incomplete\"],\"visibleStatuses\":[\"Preferred Standard\",\"Standard\",\"Qualified\",\"Recorded\",\"Candidate\",\"Incomplete\"]}";
        String response = given().contentType("application/json; charset=UTF-16").body(query).when().post(baseUrl + "/elasticSearchExport/cde?type=xml").asString();
        Assert.assertTrue(response.replaceAll("\\s+", "").contains(("<dataElement>\n" +
                "    \t<naming>\n" +
                "    \t\t<designation>Visible Light Exposure Created By java.lang.String</designation>\n" +
                "    \t\t<definition>Electromagnetic radiation in the portion of the spectrum from about 380 nm (violet) to 800 nm (red).:The act of subjecting someone or something to an influencing experience._Indicates the person or authoritative body who brought the item into existence._Generic value domain for a java datatype that is a class that represents character strings.</definition>\n" +
                "    \t\t<languageCode>EN-US</languageCode>\n" +
                "    \t\t<context>\n" +
                "    \t\t\t<contextName>Health</contextName>\n" +
                "    \t\t\t<acceptability>preferred</acceptability>\n" +
                "    \t\t</context>\n" +
                "    \t</naming>\n" +
                "    \t<steward>caBIG</steward>\n" +
                "    \t<tinyId>53ONNvVKNt3</tinyId>\n" +
                "    \t<ids>\n" +
                "    \t\t<source>caDSR</source>\n" +
                "    \t\t<id>3101967</id>\n" +
                "    \t\t<version>1</version>\n" +
                "    \t</ids>\n" +
                "    \t<property>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Created By</name>\n" +
                "    \t\t\t<origin>NCI Thesaurus</origin>\n" +
                "    \t\t\t<originId>C42628</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t</property>\n" +
                "    \t<objectClass>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Visible Light</name>\n" +
                "    \t\t\t<origin>NCI Thesaurus</origin>\n" +
                "    \t\t\t<originId>C17732</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Exposure</name>\n" +
                "    \t\t\t<origin>NCI Thesaurus</origin>\n" +
                "    \t\t\t<originId>C17941</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t</objectClass>\n" +
                "    \t<imported>2014-12-10T20:59:15.793Z</imported>\n" +
                "    \t<version>1</version>\n" +
                "    \t<dataElementConcept>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Visible Light Exposure Created By</name>\n" +
                "    \t\t\t<origin>NCI caDSR</origin>\n" +
                "    \t\t\t<originId>3100727v1</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t</dataElementConcept>\n" +
                "    \t<source>caDSR</source>\n" +
                "    \t<valueDomain>\n" +
                "    \t\t<name>java.lang.String</name>\n" +
                "    \t\t<datatype>java.lang.String</datatype>\n" +
                "    \t</valueDomain>\n" +
                "    \t<classification>\n" +
                "    \t\t<stewardOrg>\n" +
                "    \t\t\t<name>caBIG</name>\n" +
                "    \t\t</stewardOrg>\n" +
                "    \t\t<elements>\n" +
                "    \t\t\t<name>caLIMS2</name>\n" +
                "    \t\t\t<elements>\n" +
                "    \t\t\t\t<name>gov.nih.nci.calims2.domain.common.environmentalcondition</name>\n" +
                "    \t\t\t</elements>\n" +
                "    \t\t</elements>\n" +
                "    \t</classification>\n" +
                "    \t<stewardOrg>\n" +
                "    \t\t<name>caBIG</name>\n" +
                "    \t</stewardOrg>\n" +
                "    \t<registrationState>\n" +
                "    \t\t<registrationStatusSortOrder>2</registrationStatusSortOrder>\n" +
                "    \t\t<registrationStatus>Qualified</registrationStatus>\n" +
                "    \t</registrationState>\n" +
                "    </dataElement>\n" +
                "    <dataElement>\n" +
                "    \t<naming>\n" +
                "    \t\t<designation>Retreatment Patient Request Type</designation>\n" +
                "    \t\t<definition>the type as related the patient&apos;s request for repeated act of the dispensing, applying, or tendering of something to another after an initial treatment.</definition>\n" +
                "    \t\t<languageCode>EN-US</languageCode>\n" +
                "    \t\t<context>\n" +
                "    \t\t\t<contextName>Health</contextName>\n" +
                "    \t\t\t<acceptability>preferred</acceptability>\n" +
                "    \t\t</context>\n" +
                "    \t</naming>\n" +
                "    \t<naming>\n" +
                "    \t\t<designation>Which rescue treatment did th</designation>\n" +
                "    \t\t<definition>Which rescue treatment did the patient choose</definition>\n" +
                "    \t\t<languageCode>EN-US</languageCode>\n" +
                "    \t\t<context>\n" +
                "    \t\t\t<contextName>Preferred Question Text</contextName>\n" +
                "    \t\t\t<acceptability>preferred</acceptability>\n" +
                "    \t\t\t<context>\n" +
                "    \t\t\t\t<contextName>Health</contextName>\n" +
                "    \t\t\t\t<acceptability>preferred</acceptability>\n" +
                "    \t\t\t</context>\n" +
                "    \t\t</context>\n" +
                "    \t</naming>\n" +
                "    \t<steward>NIDCR</steward>\n" +
                "    \t<tinyId>G8kQ2BoBFNM</tinyId>\n" +
                "    \t<ids>\n" +
                "    \t\t<source>caDSR</source>\n" +
                "    \t\t<id>2743854</id>\n" +
                "    \t\t<version>1</version>\n" +
                "    \t</ids>\n" +
                "    \t<origin>PEARL CRF:Practitioners Engaged in Applied Research and Learning Network Case Report Form</origin>\n" +
                "    \t<property>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Patient</name>\n" +
                "    \t\t\t<origin>NCI Thesaurus</origin>\n" +
                "    \t\t\t<originId>C16960</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t\t<concepts>\n" +
                "    \t\t\t<name>Request</name>\n" +
                "    \t\t\t<origin>NCI Thesaurus</origin>\n" +
                "    \t\t\t<originId>C48312</originId>\n" +
                "    \t\t</concepts>\n" +
                "    \t</property>").replaceAll("\\s+", "")));

    }
}
