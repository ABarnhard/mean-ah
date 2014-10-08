#!/bin/bash

mongoimport --jsonArray --drop --db mean-ah --collection cards --file ../cards.json
#mongoimport --jsonArray --drop --db mean-ah --collection cards --file ../allcards.json

