export default async function parseNewsArticleHTMLByOpenAI(html, chat) {
    let validationPrompt = `Below is an HTML of a news article that was got from a news website. The HTML content may or may not actually contain news article. Does the HTML contain news article?. Return either true or false as string and nothing else and no quotation signs.\n\n ${html}`;
    chat.setAssistantModel("gpt-4o-mini");
    await chat.addUserMessage(validationPrompt);
    let validationMessage = await chat.submit();
    let validationMessageContent = ((validationMessage?.content ?? []).find((content) => content.type === "text")  ?? null);
    let validationResult = (validationMessageContent?.text.value) ?? null;
    let isValidArticle = (validationResult ?? "false").toLowerCase().indexOf("true") >= 0;
    if (!isValidArticle) return failedResponse;
    // extract news title and body
    let requestPrompt = `From the HTML, extract the news content. Return the JSON in this format: {"title":"<news_title>", "body":"<news_body>"}. Do not return anything else.`;
    await chat.addUserMessage(requestPrompt);
    let extractionMessage = await chat.submit();
    if(extractionMessage == null) return failedResponse;
    let extractionMessageContent = ((extractionMessage?.content ?? []).find((content) => content.type === "text"));
    let extractionResult = (extractionMessageContent?.text.value) ?? "{}";
    let resultStart = extractionResult.indexOf("{");
    let resultEnd = extractionResult.lastIndexOf("}") + 1;

    if(resultStart == -1 || resultEnd == -1 || (resultEnd - 1) <= resultStart) return failedResponse; // no result found
    extractionResult = extractionResult.substring(resultStart, resultEnd);
    let parsedResultJson = JSON.parse(extractionResult);
    let title = parsedResultJson.title ?? "";
    let body = parsedResultJson.body ?? "";

    if(body == "") return failedResponse;
    // extract images
    let imageRequestPrompt = `From the HTML, extract all image URLs for the news article. Do not include author profile image or anything not related to the news. Return the extraction result in json array of strings. Do not return anything else.`;
    await chat.addUserMessage(imageRequestPrompt);
    let imageMessage = await chat.submit();
    if(imageMessage == null) return failedResponse;
    let imageMessageContent = ((imageMessage?.content?? []).find((content) => content.type === "text"));
    let imageResult = (imageMessageContent?.text.value) ?? "[]";
    let imageResultStart = imageResult.indexOf("[");
    let imageResultEnd = imageResult.lastIndexOf("]") + 1;
    let images = [];
    if(imageResultStart == -1 || imageResultEnd == -1 || (imageResultEnd - 1) <= imageResultStart) {
        images = [];
    } else {
        imageResult = imageResult.substring(imageResultStart, imageResultEnd)
        images = JSON.parse(imageResult);
        images = images.map(img => ({url: img}));
    }
    return {
        title,
        body,
        images,
        isValidArticle,
    }
}

const failedResponse = {isValidArticle: false, title: "", body: "", images: []};
