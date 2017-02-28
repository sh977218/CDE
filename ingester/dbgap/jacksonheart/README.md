1. Get list of data from dataset ftp folder:
  * ex. ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/phs000286/phs000286.v5.p1/pheno_variable_summaries/
2. Substitute study URL and run to download the files:
  * cat list.txt | xargs -I $ curl -o $ ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/phs000286/phs000286.v5.p1/pheno_variable_summaries/$
3. Run to import:
  * node loadJacksonHeartStudy.js
