#!/bin/bash

sed -i '
s/ ng-version="[^"]*"//g
s/routerlink="[^"]*"//g
s/<!---->//g
s/<cde-ie-banner _nghost-c0=""><\/cde-ie-banner>//
s/data-upgraded=",MaterialLayout"//
s/<div aria-expanded="false" role="button" tabindex="0" class="mdl-layout__drawer-button"><i class="material-icons">.<\/i><\/div>//
s/ class="ng-star-inserted"//g
s/src="\/app\//data-src="\/launch\//g
s/srcset="\/app\//data-srcset="\/launch\//g
s/ ng-star-inserted//g
s/ng-star-inserted //g
s/<mat-menu class="ng-tns-c2-0"><\/mat-menu>/<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="boardsMenu"><li class="mdl-menu__item"><a class="mat-menu-item" id="menu_qb_link" href="\/quickBoard" class="mdl-menu__item mdl-typography--text-uppercase">Quick\&nbsp;Board<\/a><\/li><li class="mdl-menu__item"><a class="mat-menu-item" href="\/boardList" class="mdl-menu__item mdl-typography--text-uppercase">Public Boards<\/a><\/li><\/ul>/g
s/<mat-menu class="ng-tns-c2-2"><\/mat-menu>/<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="helpLink"><li class="mdl-menu__item"><a id="takeATourLink" href="\/home?tour=yes" class="mdl-menu__item mdl-typography--text-uppercase">Take a Tour<\/a><\/li><li class="mdl-menu__item"><a id="whatsNewLink" href="\/whatsNew" class="mdl-menu__item mdl-typography--text-uppercase">New Features<\/a><\/li><li class="mdl-menu__item"><a id="videos" href="\/videos" class="mdl-menu__item mdl-typography--text-uppercase">Videos<\/a><\/li><li class="mdl-menu__item"><a id="apiDocumentationLink" href="\/api" class="mdl-menu__item mdl-typography--text-uppercase">API<\/a><\/li><li class="mdl-menu__item"><a id="contactUsLink" href="\/contactUs" class="mdl-menu__item mdl-typography--text-uppercase">Contact Us<\/a><\/li><\/ul>/g
s/<mat-menu class="ng-tns-c2-3"><\/mat-menu>/<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="drawer_boardsMenu"><li class="mdl-menu__item"><a class="mat-menu-item" id="drawer_menu_qb_link" href="\/quickBoard" class="mdl-menu__item mdl-typography--text-uppercase">Quick\&nbsp;Board<\/a><\/li><li class="mdl-menu__item"><a class="mat-menu-item" href="\/boardList" class="mdl-menu__item mdl-typography--text-uppercase">Public Boards<\/a><\/li><\/ul>/
s/<mat-menu class="ng-tns-c2-5"><\/mat-menu>/<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="drawer_helpLink"><li class="mdl-menu__item"><a href="\/home?tour=yes" class="mdl-menu__item mdl-typography--text-uppercase">Take a Tour<\/a><\/li><li class="mdl-menu__item"><a href="\/whatsNew" class="mdl-menu__item mdl-typography--text-uppercase">New Features<\/a><\/li><li class="mdl-menu__item"><a href="\/videos" class="mdl-menu__item mdl-typography--text-uppercase">Videos<\/a><\/li><li class="mdl-menu__item"><a class="mdl-menu__item mdl-typography--text-uppercase" href="\/api">API<\/a><\/li><li class="mdl-menu__item"><a href="\/contactUs" class="mdl-menu__item mdl-typography--text-uppercase">Contact Us<\/a><\/li><\/ul>/
s/<ngb-carousel class/<ngb-carousel id="featureCarousel" data-ride="carousel" class/g
s/" class="active"><\/li>/"><\/li>/g
s/<li id="ngb-slide-0">/<li id="ngb-slide-0" class="active" data-target="#featureCarousel" data-slide-to="0">/
s/<li id="ngb-slide-1">/<li id="ngb-slide-1" data-target="#featureCarousel" data-slide-to="1">/
s/<li id="ngb-slide-2">/<li id="ngb-slide-2" data-target="#featureCarousel" data-slide-to="2">/
s/<li id="ngb-slide-3">/<li id="ngb-slide-3" data-target="#featureCarousel" data-slide-to="3">/
s/<li id="ngb-slide-4">/<li id="ngb-slide-4" data-target="#featureCarousel" data-slide-to="4">/
s/<div class="carousel-item active">/<div class="carousel-item">/g
s/<div class="carousel-item">/<div class="carousel-item active">/
s/id="takeATourBtn">/id="takeATourBtn" href="\/tour">/
' "modules/_app/staticHome/nihcde.html"
