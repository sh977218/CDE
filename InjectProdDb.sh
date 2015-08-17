#!/bin/sh

NODE_LOC='.'

db_user='siteRootAdmin'
db_password='password'


mongorestore -d test -c dataelements C:/NLMCDE/nlmcde.dump.7.29.2015/nlmcde/dataelements.bson -u $db_user -p $db_password -authenticationDatabase admin

#mongo test deploy/dbProdInit.js -u $db_user -p $db_password -authenticationDatabase admin

#mongorestore -d test -u $db_user -p $db_password -authenticationDatabase admin C:/NLMCDE/nlmcde.dump.7.29.2015/nlmcde