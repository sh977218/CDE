package gov.nih.nlm.ninds.form;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class Constants {

    public static final Map<String, String> DISEASE_MAP;
    public static final Map<String, String> FIELD_PROPERTY_MAP;
    public static final int DISEASE_NUM;
    public static final int MAX_DATATYPE_SIZE = 4;
    public static final int MAX_INPUT_RESTRICTIONS_SIZE = 3;
    public static final int TOTAL_PAGE = 31;
    public static final int TOTAL_RECORD = 3037;
    public static final String URL = "https://commondataelements.ninds.nih.gov/CRF.aspx";

    public static String MONGO_URL = "mongodb://miguser:password@localhost:27017/migration";

    static {
        Map<String, String> aMap = new HashMap<String, String>();
        aMap.put("General (For all diseases)", "General.aspx");
        aMap.put("Amyotrophic Lateral Sclerosis", "ALS.aspx");
        aMap.put("Cerebral Palsy", "CP.aspx");
        aMap.put("Chiari I Malformation", "CM.aspx");
        aMap.put("Epilepsy", "Epilepsy.aspx");
        aMap.put("Friedreich's Ataxia", "FA.aspx");
        aMap.put("Headache", "Headache.aspx");
        aMap.put("Huntington’s Disease", "HD.aspx");
        aMap.put("Mitochondrial Disease", "MITO.aspx");
        aMap.put("Multiple Sclerosis", "MS.aspx");
        aMap.put("Neuromuscular Diseases", "NMD.aspx");
        aMap.put("Congenital Muscular Dystrophy", "CMD.aspx");
        aMap.put("Duchenne/Becker Muscular Dystrophy", "DMD.aspx");
        aMap.put("Facioscapulohumeral muscular dystrophy (FSHD)", "FSHD.aspx");
        aMap.put("Myasthenia Gravis", "MG.aspx");
        aMap.put("Myotonic Dystrophy", "MMD.aspx");
        aMap.put("Spinal Muscular Atrophy", "SMA.aspx");
        aMap.put("Parkinson's Disease", "PD.aspx");
        aMap.put("Spinal Cord Injury", "SCI.aspx");
        aMap.put("Spinal Muscular Atrophy", "SMA.aspx");
        aMap.put("Stroke", "Stroke.aspx");
        aMap.put("Unruptured Cerebral Aneurysms and Subarachnoid Hemorrhage", "SAH.aspx");
        aMap.put("Traumatic Brain Injury", "TBI.aspx");
        aMap.put("Sports-Related Concussion", "SRC.aspx");
        DISEASE_MAP = Collections.unmodifiableMap(aMap);
        DISEASE_NUM = DISEASE_MAP.size();
    }

    static {
        Map<String, String> aMap = new HashMap<String, String>();
        aMap.put("CDE ID", "cdeId");
        aMap.put("CDE Name", "cdeName");
        aMap.put("Variable Name", "variableName");
        aMap.put("Definition / Description", "definitionDescription");
        aMap.put("Question Text", "questionText");
        aMap.put("Permissible Value", "permissibleValue");
        aMap.put("Description", "permissibleDescription");
        aMap.put("Data Type", "dataType");
        aMap.put("Instructions", "instruction");
        aMap.put("References", "reference");
        aMap.put("Population", "population");
        aMap.put("Classification (e.g., Core)", "classification");
        aMap.put("Version #", "versionNum");
        aMap.put("Version Date", "versionDate");
        aMap.put("Aliases for Variable Name", "aliasesForVariableName");
        aMap.put("CRF Module / Guideline", "crfModuleGuideline");
        aMap.put("© or TM", "copyright");
        aMap.put("Sub-Domain", "subDomain");
        aMap.put("Domain", "domain");
        aMap.put("Previous Title", "previousTitle");
        aMap.put("Size", "size");
        aMap.put("Input Restrictions", "inputRestrictions");
        aMap.put("Min Value", "minValue");
        aMap.put("Max Value", "maxValue");
        aMap.put("Measurement Type", "measurementType");
        aMap.put("LOINC ID", "loincId");
        aMap.put("SNOMED", "snomed");
        aMap.put("caDSR ID", "cadsrId");
        aMap.put("CDISC ID", "cdiscId");
        FIELD_PROPERTY_MAP = Collections.unmodifiableMap(aMap);
    }

    private Constants() {
        throw new AssertionError();
    }
}