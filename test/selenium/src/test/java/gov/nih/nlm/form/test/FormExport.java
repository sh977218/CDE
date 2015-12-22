package gov.nih.nlm.form.test;

import static com.jayway.restassured.RestAssured.get;
import org.testng.Assert;
import org.testng.annotations.Test;
import org.openqa.selenium.By;

public class FormExport extends BaseFormTest {
    @Test
    public void odmExport() {
        String response = get(baseUrl + "/form/7JrNn_FIx?type=xml&subtype=odm").asString();
        String[] expectedResults =
                {"<Study OID=\"7JrNn_FIx\">",
                "<GlobalVariables>",
                "<StudyName>PROMIS SF v2.0 - Instrumental Support 8a</StudyName>",
                "<StudyDescription>N/A</StudyDescription>",
                "<ProtocolName>PROMIS SF v2.0 - Instrumental Support 8a</ProtocolName>",
                "</GlobalVariables>",
                "<BasicDefinitions/>",
                "<MetaDataVersion Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"MDV_7JrNn_FIx\">",
                "<Protocol>",
                "<StudyEventRef Mandatory=\"Yes\" OrderNumber=\"1\" StudyEventOID=\"SE_7JrNn_FIx\"/>",
                "</Protocol>",
                "<StudyEventDef Name=\"SE\" OID=\"SE_7JrNn_FIx\" Repeating=\"No\" Type=\"Unscheduled\">",
                "<FormRef FormOID=\"7JrNn_FIx\" Mandatory=\"Yes\" OrderNumber=\"1\"/>",
                "</StudyEventDef>",
                "<FormDef Name=\"PROMIS SF v2.0 - Instrumental Support 8a\" OID=\"7JrNn_FIx\" Repeating=\"No\">",
                "<ItemGroupRef ItemGroupOID=\"d2c24d59e0baff4d0155fbdf62590867\" Mandatory=\"Yes\" OrderNumber=\"1\"/>",
                "</FormDef>",
                "<ItemGroupDef Name=\"Section\" OID=\"d2c24d59e0baff4d0155fbdf62590867\" Repeating=\"No\">",
                "<Description>",
                "<TranslatedText xml:lang=\"en\">Section</TranslatedText>",
                "</Description>",
                "<ItemRef ItemOID=\"QJvJOh1Ql_s0_q0\" Mandatory=\"Yes\" OrderNumber=\"0\"/>",
                "<ItemRef ItemOID=\"myePJdnkml_s0_q1\" Mandatory=\"Yes\" OrderNumber=\"1\"/>",
                "<ItemRef ItemOID=\"Qy_vkdnJmx_s0_q2\" Mandatory=\"Yes\" OrderNumber=\"2\"/>",
                "<ItemRef ItemOID=\"7yMvJ_3Jme_s0_q3\" Mandatory=\"Yes\" OrderNumber=\"3\"/>",
                "<ItemRef ItemOID=\"QJmDkOhyme_s0_q4\" Mandatory=\"Yes\" OrderNumber=\"4\"/>",
                "<ItemRef ItemOID=\"m14P1d21Xl_s0_q5\" Mandatory=\"Yes\" OrderNumber=\"5\"/>",
                "<ItemRef ItemOID=\"mkHv1dhy7x_s0_q6\" Mandatory=\"Yes\" OrderNumber=\"6\"/>",
                "<ItemRef ItemOID=\"mkUwk_hymg_s0_q7\" Mandatory=\"Yes\" OrderNumber=\"7\"/>",
                "</ItemGroupDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help you if you are confined to bed?\" OID=\"QJvJOh1Ql_s0_q0\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to help you if you are confined to bed?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to take you to the doctor if you need it?\" OID=\"myePJdnkml_s0_q1\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to take you to the doctor if you need it?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help with your daily chores if you are sick?\" OID=\"Qy_vkdnJmx_s0_q2\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to help with your daily chores if you are sick?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to run errands if you need it?\" OID=\"7yMvJ_3Jme_s0_q3\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">Do you have someone to run errands if you need it?</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to prepare your meals if you are unable to do it yourself?\" OID=\"QJmDkOhyme_s0_q4\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to prepare your meals if you are unable to do it yourself?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to take over all of your responsibilities at home if you need it?\" OID=\"m14P1d21Xl_s0_q5\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to take over all of your responsibilities at home if you need it?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Is someone available to help you if you need it?\" OID=\"mkHv1dhy7x_s0_q6\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">Is someone available to help you if you need it?</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<ItemDef DataType=\"text\" Name=\"Do you have someone to help you clean up around the home if you need it?\" OID=\"mkUwk_hymg_s0_q7\">",
                "<Question>",
                "<TranslatedText xml:lang=\"en\">",
                "Do you have someone to help you clean up around the home if you need it?",
                "</TranslatedText>",
                "</Question>",
                "<CodeListRef CodeListOID=\"CL_QJvJOh1Ql_s0_q0\"/>",
                "</ItemDef>",
                "<CodeList DataType=\"text\" OID=\"CL_QJvJOh1Ql_s0_q0\" Name=\"Do you have someone to help you if you are confined to bed?\">",
                "<CodeListItem CodedValue=\"1\">",
                "<Decode>",
                "<TranslatedText xml:lang=\"en\">Never</TranslatedText>",
                "</Decode>",
                "<Alias Context=\"LOINC\" Name=\"LA6270-8\"/>",
                "</CodeListItem>",
                "<CodeListItem CodedValue=\"2\">",
                "<Decode>",
                "<TranslatedText xml:lang=\"en\">Rarely</TranslatedText>",
                "</Decode>",
                "<Alias Context=\"LOINC\" Name=\"LA10066-1\"/>",
                "</CodeListItem>",
                "<CodeListItem CodedValue=\"3\">",
                "<Decode>",
                "<TranslatedText xml:lang=\"en\">Sometimes</TranslatedText>",
                "</Decode>",
                "<Alias Context=\"LOINC\" Name=\"LA10082-8\"/>",
                "</CodeListItem>",
                "<CodeListItem CodedValue=\"4\">",
                "<Decode>",
                "<TranslatedText xml:lang=\"en\">Usually</TranslatedText>",
                "</Decode>",
                "<Alias Context=\"LOINC\" Name=\"LA14747-2\"/>",
                "</CodeListItem>",
                "<CodeListItem CodedValue=\"5\">",
                "<Decode>",
                "<TranslatedText xml:lang=\"en\">Always</TranslatedText>",
                "</Decode>",
                "<Alias Context=\"LOINC\" Name=\"LA9933-8\"/>",
                "</CodeListItem>",
                "</CodeList>",
                "</MetaDataVersion>",
                "</Study>",
                "</ODM>"};

        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult));
        }

        for (int i = 0; i < expectedResults.length - 2; i++) {
            String twoLines = expectedResults[i] + "\n" + expectedResults[i+1];
            Assert.assertTrue(response.replaceAll("\\s+","").contains(twoLines.replaceAll("\\s+","")), "missing: " + twoLines);
        }

    }

    @Test
    public void jsonExport() {
        String form = "Adverse Event Tracking Log";
        goToFormByName(form);

        findElement(By.id("export")).click();
        findElement(By.id("nihJson")).click();

        switchTab(1);
        String response = findElement(By.cssSelector("HTML")).getAttribute("innerHTML");
        Assert.assertTrue(response.contains("{\"title\":\"CRF\",\"uri\":\"https://commondataelements.ninds.nih.gov/Doc/EPI/F1126_Adverse_Event_Tracking_Log.docx\"}"));
        Assert.assertTrue(response.contains("{\"permissibleValue\":\"Yes\",\"valueMeaningName\":\"Yes\"}"));
        Assert.assertTrue(response.contains("\"registrationState\":{\"registrationStatus\":\"Qualified\"}"));
        Assert.assertTrue(response.contains("\"stewardOrg\":{\"name\":\"NINDS\"}"));
        Assert.assertTrue(response.contains("\"naming\":[{\"designation\":\"Adverse Event Tracking Log\""));
        switchTabAndClose(0);
    }


    @Test
    public void xmlExport() {
        String form = "Parenchymal Imaging";
        goToFormByName(form);

        findElement(By.id("export")).click();
        String url = findElement(By.id("nihXml")).getAttribute("href");
        String response = get(url).asString();
        Assert.assertTrue(response.replaceAll("\\s+","").contains(("<naming>\n" +
                "<designation>Parenchymal Imaging</designation>\n" +
                "<definition>\n" +
                "Contains data elements collected when an imaging study is performed to measure parenchyma; data recorded attempt to divide the strokes into ischemic or hemorrhagic subtypes, as distinction of hemorrhage versus infarction is the initial critical branch point in acute stroke triage. (Examples of CDEs included: Acute infarcts present; Planimetic acute ischemic lesion volume; and Acute hematoma present)\n" +
                "</definition>\n" +
                "</naming>").replaceAll("\\s+", "")));
    }


}
