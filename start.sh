#!/bin/bash

meteor npm install
meteor update

echo "Add S3 settings to ../settings.json"

meteor --settings ../settings.json
