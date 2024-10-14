# Unified News Extractor
Parse any news article. This project is to be run as an actor on apify.com

## This is a work in progress
Currently, support just ABCNews and Reuters

## Run locally
`apify run -p --input '{"useApifyProxy": true, "links":[{"url":"https://abcnews.go.com/Technology/wireStory/northern-lights-dazzle-farther-south-normal-show-114724380"}]}'`
