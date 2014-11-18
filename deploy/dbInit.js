db.users.remove({});
db.dataelements.remove({});
db.orgs.remove({});
db.forms.remove({});
db.pinningBoards.remove({});
db.messages.remove({});
db.sessions.remove({});

var defaultBoard = {
    name: "default"
    , shareStatus: "Private"
    , pins: []
};

db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true, orgAdmin: ["caBIG","CTEP","NINDS","ACRIN","PS&CC"], viewHistory: []});
db.users.insert({username: 'cabigAdmin', password: 'pass', orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'user1', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'reguser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ctepCurator', password: 'pass', orgCurator: ["CTEP"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'testuser', password: 'Test123', quota: 1073741824, viewHistory: [], email: "test@example.com"});
db.users.insert({username: 'boarduser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduser1', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduser2', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'pinuser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'boarduserEdit', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'historyuser', password: 'pass', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'appScan', password: 'I@mA88Scan', quota: 1073741824, viewHistory: []});
db.users.insert({username: 'classificationMgtUser', password: 'pass', orgCurator: ["CTEP","NINDS"], orgAdmin: ["caBIG"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'phri', password: 'pass', orgCurator: ["PHRI"], orgAdmin: ["PHRI"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'ninds', password: 'pass', orgCurator: [], orgAdmin: ["NINDS"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'acrin', password: 'pass', orgCurator: ["ACRIN"], orgAdmin: [], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'grdr', password: 'pass', orgCurator: [], orgAdmin: ["GRDR"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'eyegene', password: 'pass', orgCurator: [], orgAdmin: ["EyeGene"], quota: 1073741824, viewHistory: []});
db.users.insert({username: 'lockedUser', password: 'pass', orgCurator: [], orgAdmin: [], viewHistory: []});
db.users.insert({username: 'wguser', password: 'pass', orgCurator: [], orgAdmin: ['WG-TEST'], viewHistory: []});
db.users.insert({username: 'transferStewardUser', password: 'pass', orgAdmin: ["PS&CC", "LCC"], quota: 1073741824, viewHistory: []});


db.orgs.insert({name: "NHLBI"});
db.orgs.insert({name: "caCORE"});
db.orgs.insert({name: "NIDCR"});
db.orgs.insert({name: "caBIG", longName: "Cancer Biomedical Informatics Grid", mailAddress: "123 Somewhere On Earth, Abc, Def, 20001", emailAddress: "caBig@nih.gov", phoneNumber: "111-222-3333", uri: "https://cabig.nci.nih.gov/"});
db.orgs.insert({name: "CTEP", longName: "Cancer Therapy Evaluation Program", mailAddress: "75 Sunshine Street, Blah, Doh 12345", uri: "https://cabig.nci.nih.gov/"});
db.orgs.insert({name: "DCP"});
db.orgs.insert({name: "PS&CC"});
db.orgs.insert({name: "CCR"});
db.orgs.insert({name: "ACRIN"});
db.orgs.insert({name: "SPOREs"});
db.orgs.insert({name: "NICHD"});
db.orgs.insert({name: "EDRN"});
db.orgs.insert({name: "CIP"});
db.orgs.insert({name: "AECC", longName: "Albert Einstein Cancer Center"});
db.orgs.insert({name: "LCC"});
db.orgs.insert({name: "USC/NCCC"});
db.orgs.insert({name: "Training"});
db.orgs.insert({name: "TEST"});
db.orgs.insert({name: "PBTC"});
db.orgs.insert({name: "CITN"});
db.orgs.insert({name: "DCI"});
db.orgs.insert({name: "CDC/PHIN"});
db.orgs.insert({name: "ECOG-ACRIN"});
db.orgs.insert({name: "OHSU Knight"});
db.orgs.insert({name: "NHC-NCI"});
db.orgs.insert({name: "NIDA"});
db.orgs.insert({name: "PhenX"});
db.orgs.insert({name: "AHRQ"});
db.orgs.insert({name: "PHRI"});
db.orgs.insert({name: "GRDR"});
db.orgs.insert({name: "WG-TEST", workingGroupOf: "caCORE", classifications: [{name: "WG Classif", elements: [{name: "WG Sub Classif"}]}]});

db.orgs.insert({ "_id" : ObjectId("546664e2e6b3836335ad72fe"), "name" : "NINDS", "classifications" : [         {   "name" : "Population",      "elements" : [  {       "name" : "Pediatric" },         {       "name" : "Adult" } ] },         {       "name" : "Domain",      "elements" : [  {       "name" : "Participant/Subject History and Family History",      "elements" : [  {       "name" : "General Health History" },    {       "name" : "Epidemiology/Environmental History" },        {       "name" : "Prior Health Status" } ] },   {       "name" : "Disease/Injury Related Events",       "elements" : [  {"name" : "Classification" },    {       "name" : "History of Disease/Injury Event" },   {       "name" : "Discharge Information" },     {       "name" : "Second Insults" } ] },        {       "name" : "Participant/Subject Characteristics",         "elements" : [  {       "name" : "Demographics" },  {   "name" : "Social Status" } ] },         {       "name" : "Participant Characteristics","elements" : [  {       "name" : "Demographics" } ] },  {       "name" : "Protocol Experience",     "elements" : [      {       "name" : "Participant/Subject Identification, Eligibility, and Enrollment" },   {       "name" : "Off Treatment/Off Study" },   {       "name" : "Protocol Deviations" } ] },   {       "name" : "Assessments and Examinations",        "elements" : [  {       "name" : "OtherClinical Data" },       {       "name" : "Imaging Diagnostics" },       {       "name" : "Non-Imaging Diagnostics" },   {       "name" : "Physical/Neurological Examination" },         {       "name" : "Vital Signs and Other Body Measures" },       {       "name" : "Physical Examinations" },     {   "name" : "Laboratory Tests and Biospecimens/Biomarkers" },  {       "name" : "Vital Signs and Laboratory Tests" },  {       "name" : "Hospital/Care Management" },  {       "name" : "Neurological Examination" },  {       "name" : "Spinal Imaging/Spinal Cord Imaging" } ] },    {       "name" : "The International SCI Data Sets",     "elements" : [  {       "name" : "The International SCI Data Sets" } ] },       {       "name" : "Outcomes and End Points",     "elements" : [  {       "name" : "Muscle Strength Testing" },   {       "name" : "Performance Measures" },      {       "name" : "Functional Status" },         {       "name" : "Pulmonary Function Testing/Respiratory Status" },     {"name" : "Assessing Comorbidities" },   {       "name" : "Electrodiagnostics" },        {       "name" : "Patient Reported Outcomes" },         {       "name" : "Neurological Impairment" },   {"name" : "Pediatric" },         {       "name" : "Functional Outcomes" },       {       "name" : "Neurological Outcomes" },     {       "name" : "Pain" },      {       "name" : "Other Clinical Data" },       {       "name" : "Clinical Event End Points" },         {       "name" : "End Points" },    {   "name" : "Activities of Daily Living/Performance" },    {       "name" : "Participation and Quality of Life" },         {       "name" : "Global Outcome" },    {       "name" : "Psychiatric and Psychological Status" },      {       "name" : "Emotional and Cognitive Status" },    {       "name" : "Neuropsychological Testing" },        {       "name" : "Social Role Participation and Social Competence" },   {       "name" : "Recovery of Consciousness/Memory Recovery" },         {       "name" : "Post-concussive/TBI-Related Symptoms" },      {       "name" : "Military Studies" },  {       "name" : "Adaptive and Daily Living Skills" },  {       "name" : "Psychological Status" },      {"name" : "Perceived Generic and Disease-Specific Health-Related Quality of Life" },     {       "name" : "Family and Environment" },    {       "name" : "Quality of Life" },   {       "name" : "Cognitive" },         {       "name" : "Behavior/Psychiatry" },       {       "name" : "Psychiatric and Psychological Functions" },   {       "name" : "Other Non-Motor" },   {       "name" : "Sleep" },{       "name" : "Motor Function" },    {       "name" : "Ataxia and Performance Measures" },   {   "name" : "Subjective Assessments/Patient and Caregiver Reported Outcomes" },        {       "name" : "Upper Motor Neuron Signs/Neuromuscular Excitability" },       {       "name" : "Activities of Daily Living/Functional Status" },      {       "name" : "Neuropsychological Impairment" },     {"name" : "Language and Communication" } ] },    {       "name" : "Participant History and Family History",      "elements" : [  {       "name" : "General Health History" },    {       "name" : "Epidemiology/Environmental History" } ] },    {       "name" : "Treatment/Intervention Data",         "elements" : [  {       "name" : "Surgeries and Other Procedures" },    {       "name" : "Therapies" },        {       "name" : "Drugs" },     {       "name" : "Devices" } ] },       {       "name" : "Safety Data",         "elements" : [  {       "name" : "Adverse Events" } ] } ] },    {       "name" : "Disease",     "elements" : [  {       "name" : "General (For all diseases)",  "elements" : [  {   "name" : "Classification",  "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" },      {       "name" : "Exploratory" } ] } ] },       {       "name" : "Friedreich's Ataxia",         "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name": "Exploratory" },       {       "name" : "Core" },      {       "name" : "Supplemental" } ] } ] },  {   "name" : "Stroke",      "elements" : [  {       "name" : "Classification",      "elements" : [{       "name" : "Supplemental" },      {       "name" : "Core" },      {       "name" : "Exploratory" } ] } ] },       {       "name" : "Multiple Sclerosis",  "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" },  {   "name" : "Exploratory" } ] } ] },       {       "name" : "Neuromuscular Disease",       "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },  {   "name" : "Core" },      {       "name" : "Exploratory" } ] } ] },       {       "name" : "Myasthenia Gravis",   "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" } ] } ] },      {       "name" : "Spinal Muscular Atrophy",     "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" },      {       "name" : "Exploratory" } ] } ] },       {       "name" : "Spinal Cord Injury",  "elements" : [  {       "name" : "Classification",  "elements" : [      {       "name" : "Supplemental" },      {       "name" : "Core" },      {"name" : "Exploratory" } ] } ] },       {       "name" : "Headache",    "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" } ] } ] },      {       "name" : "Traumatic Brain Injury",      "elements" : [  {       "name" : "Acute Hospitalized",  "elements" : [  {       "name" : "Classification",      "elements" : [{       "name" : "Supplemental" },      {       "name" : "Core" },      {       "name" : "Basic" } ] } ] },     {       "name" : "Concussion/Mild TBI",         "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" },  {   "name" : "Basic" } ] } ] },     {       "name" : "Epidemiology",        "elements" : [  {"name" : "Classification",      "elements" : [  {       "name" : "Supplemental" },      {       "name" : "Core" },      {       "name" : "Basic" } ] } ] },     {       "name" : "Moderate/Severe TBI: Rehabilitation",         "elements" : [  {       "name" : "Classification",      "elements" : [  {   "name" : "Supplemental" },  {       "name" : "Core" },      {       "name" : "Basic" } ] } ] } ] },        {       "name" : "Parkinson's Disease",         "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Core" },      {       "name" : "Supplemental" },{       "name" : "Exploratory" } ] } ] },       {       "name" : "Amyotrophic Lateral Sclerosis",   "elements" : [      {       "name" : "Classification",      "elements" : [  {       "name" : "Core"},      {       "name" : "Supplemental" },      {       "name" : "Exploratory" } ] } ] },       {   "name" : "Huntington's Disease",    "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Core" },      {       "name" : "Supplemental" },      {       "name" : "Exploratory" } ] } ] },       {       "name" : "Duchenne Muscular Dystrophy/Becker Muscular Dystrophy",       "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Core" },      {       "name" : "Supplemental" } ] } ] },      {       "name" : "Epilepsy",    "elements" : [  {       "name" : "Classification",      "elements" : [  {       "name" : "Core" },      {   "name" : "Supplemental" } ] } ] } ] } ] });

