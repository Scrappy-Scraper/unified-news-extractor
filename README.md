# Unified News Extractor
Parse news articles from ANY news website.<br />
This project is made using `crawlee` and can be run as an actor on [apify.com](https://apify.com)

## Parsers
### 1. Site-Specific Parsers
Dedicated parsers written for the target news sites.<br />
The parsing process is often quick and use very little resource.<br />
See below for current List of Site-Specific Parsers.

### 2. OpenAI Parser
For sites not supported by Site-Specific Parsers, use OpenAI to parse the HTML.<br />
To use this feature, you need to include `openAIAPIKey` in the request body

## List of Site-Specific Parsers
`ABCNews`, `Reuters`

## Run locally on Commandline
`apify run -p --input '{"useApifyProxy": true, "links":[{"url":"https://abcnews.go.com/Technology/wireStory/northern-lights-dazzle-farther-south-normal-show-114724380"}]}'`


## Request Body
```json
{
    "links":[
        {"url":"<url-to-the-news-article>"}
    ],
    "callbackUrl":"<callback-url-for-POST-request>",
    "openAIAPIKey":"<put-your-OpenAI-key-here>",
    "openAIParse": true,
    "useApifyProxy": true
}
```

| Field | Type            | Required | Default | Comment                                                                                                                                                                                                                      |
| ----- |-----------------|----------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| links | {"url": string}[] | **Yes**  | (N/A)   | A list of URLs to the news articles                                                                                                                                                                                          |
| callbackUrl | string | No       | NULL    | Called as POST Request. Called each time a parsing of an article is DONE                                                                                                                                                     |
| openAIAPIKey | string | No       | NULL    | Include it to get the AI Features                                                                                                                                                                                            |
| openAIParse | boolean | No       | True    | For websites of ***Non-Site-Specific Parsers***, when set to `true` and provided with `openAIAPIKey`, call OpenAI to do the parsing                                                                                          |
| useApifyProxy | boolean | No       | True    | Whether to use Apify's Proxy                                                                                                                                                                                                 |
