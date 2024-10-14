import _Parser from "./_Parser.js";
import {simplifyElements} from "../simplifyElements.js";
import cleanBlankCharacters from "../cleanBlankCharacters.js";

export default class fallback extends _Parser {
    sampleUrls = [];
    isAcceptedWebsite(url) {return true}
    getCrawlerTag(url) { return "puppeteer.browser" }

    async parse(context) {
        let {request, page, enqueueLinks, log, pushData, parseWithCheerio} = context;
        let url = request.loadedUrl;
        // if parsing is not supported, return a generic error message and the simplified HTML
        let $ = await parseWithCheerio();
        let images = $("img").map((_ind, img) => {
            return {
                url: $(img).attr("src")?? "",
            };
        }).get();
        let titleDom = $('title').get()[0] ?? null;
        let pageTitle = (titleDom != null) ? cleanBlankCharacters($(titleDom).text()) : "";
        return {
            success: false,
            url,
            pageTitle,
            errorCode: "noSupportedParser",
            errorMessage: `Unsupported website: ${url}`,
            html: simplifyElements($).html(),
            images
        };
    }
}
