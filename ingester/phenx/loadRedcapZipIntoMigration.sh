#!/bin/bash
for i in *.zip; do
{
instrument=$i/instrument.csv
if [ ! -f $instrument ]; then
    j=${i/.zip/''}
	instrument=$i/$j/instrument.csv
fi
	mongoimport -u miguser -p password --db migration -c redcap --type csv --file $instrument  --fields "Variable,FormName,SectionHeader,FieldType,FieldLabel,ChoicesCalculationsORSliderLabels,FieldNote,TextValidationTypeORShowSliderNumber,TextValidationMin,TextValidationMax,Identifier,BranchingLogic,RequiredField,CustomAlignment,QuestionNumberSurveysOnly,MatrixGroupName,MatrixRanking"
} || {
	echo $i
}
done