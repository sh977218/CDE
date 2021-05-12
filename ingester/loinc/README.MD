# If you encounter loinc classification map error
* open S:/MLB/CDE/LOINC/LOINCUsersGuide.pdf
* search for the missing type and update the corresponding csv file located in S:/MLB/CDE/LOINC/classification_map
* If the term is not in pdf (S:/MLB/CDE/LOINC/classification_map/LOINCUsersGuide.pdf), download new version pdf from https://loinc.org/learn/
## See S:/MLB/CDE/LOINC/classification_map/mongoimport.txt
#### run those command to import loinc classification map
`
mongoimport --username miguser --password password --db migration --collection LoincClassificationMapping --type csv --headerline --file '/s/MLB/CDE/LOINC/classification_map/attachment_term_classes.csv'
mongoimport --username miguser --password password --db migration --collection LoincClassificationMapping --type csv --headerline --file '/s/MLB/CDE/LOINC/classification_map/clinical_term_classes.csv'
mongoimport --username miguser --password password --db migration --collection LoincClassificationMapping --type csv --headerline --file '/s/MLB/CDE/LOINC/classification_map/laboratory_term_classes.csv'
mongoimport --username miguser --password password --db migration --collection LoincClassificationMapping --type csv --headerline --file '/s/MLB/CDE/LOINC/classification_map/survey_term_classes.csv'
`
