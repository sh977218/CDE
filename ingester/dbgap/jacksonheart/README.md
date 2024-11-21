1. Get list of data file from dataset ftp folder and store in list.txt or similar:

* ex. ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/phs000286/phs000286.v5.p1/pheno_variable_summaries/

2. Make and change to the raw directory.

* mkdir raw
* cd raw

3. Substitute study URL and run to download the files:

* cat ../list.txt | xargs -I $ curl
  -o $ ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/phs000286/phs000286.v5.p1/pheno_variable_summaries/$

4. Run to import:

* node loadJacksonHeartStudy.js
