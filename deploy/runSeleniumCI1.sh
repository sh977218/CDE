export host_name=`hostname`
export downloadFolder=/usr/nlm/selenium/cde/downloads/$host_name
export chromeDownloadFolder=\\\\NLMSAMBASERVER\\selenium\\cde\\downloads\\$host_name
rm -rf $downloadFolder
mkdir $downloadFolder

/usr/nlm/apps/gradle/bin/gradle --no-daemon --max-workers=$forkNb --parallel -DforkNb=$forkNb -DchromeDownloadFolder=$chromeDownloadFolder -DdownloadFolder=$downloadFolder -DtestUrl=http://local-cde-dev-1.nlm.nih.gov:3001 -DhubUrl=${bamboo.GRID_URL} -Dtimeout=30 -Dbrowser=$bamboo_BROWSER -Djava.io.tmpdir=/usr/nlm/apps/tmp -b build.gradle test

