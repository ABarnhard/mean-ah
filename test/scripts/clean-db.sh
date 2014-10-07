#!/bin/bash

if [ -z "$1" ] ; then
  echo "Enter a database name"
  exit 1
fi

mongoimport --jsonArray --drop --db $1 --collection cards --file ../../db/test-cards.json
mongoimport --jsonArray --drop --db $1 --collection users --file ../../db/users.json
mongoimport --jsonArray --drop --db $1 --collection games --file ../../db/games.json
mongoimport --jsonArray --drop --db $1 --collection decks --file ../../db/decks.json

