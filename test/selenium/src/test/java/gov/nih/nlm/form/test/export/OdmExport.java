package gov.nih.nlm.form.test.properties.test.export;

import static com.jayway.restassured.RestAssured.get;

import gov.nih.nlm.form.test.properties.test.BaseFormTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class OdmExport extends BaseFormTest {
    @Test
    public void odmExport() {
        mustBeLoggedInAs(reguser_username, password);

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
                "</Study>"
                };

        for (String expectedResult : expectedResults) {
            Assert.assertTrue(response.contains(expectedResult), "missing: " + expectedResult + "\n Actual: \n " + response);
        }

        for (int i = 0; i < expectedResults.length - 2; i++) {
            String twoLines = expectedResults[i] + "\n" + expectedResults[i+1];
            Assert.assertTrue(response.replaceAll("\\s+","").contains(twoLines.replaceAll("\\s+","")),
                    "missing: " + twoLines);
        }

    }


}
