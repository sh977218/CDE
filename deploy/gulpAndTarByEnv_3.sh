export host_name=`hostname`

if [ "$host_name" == "dvlb7cde01" ]
then
sh ./deploy/gulpAndTarCI1.sh
fi
if [ "$host_name" == "dvlb7cde02" ]
then
sh ./deploy/gulpAndTarCI2.sh
fi
