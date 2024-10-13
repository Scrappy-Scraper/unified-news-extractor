import parsers from './parsers/index.js';
import {simplifyElements} from "./simplifyElements.js";

export default async function parse(context) {
    let {request, page, parseWithCheerio} = context;
    let url = request.loadedUrl;
    let parserNames = Object.keys(parsers);

    // loop through all available parsers and check if the current URL matches the parser's supported website
    for(let ind = 0; ind < parserNames.length; ind++) {
        let parser = parsers[parserNames[ind]];
        if(parser.isAcceptedWebsite(url)) { // match found
            return await parser.parse(context);
        }
    }

    // if parsing is not supported, return a generic error message and the simplified HTML
    let $ = await parseWithCheerio();
    let images = $("img").map((_ind, img) => {
        return {
            url: $(img).attr("src")?? "",
        };
    }).get();
    return {
        success: false,
        url,
        errorCode: "noSupportedParser",
        errorMessage: `Unsupported website: ${url}`,
        html: simplifyElements($).html(),
        images
    };
}

