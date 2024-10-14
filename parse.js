import {fallbackParser, findParser} from './parsers/index.js';

export default async function parse(context) {
    let {request, page, parseWithCheerio} = context;
    let url = request.loadedUrl;

    // loop through all available parsers and check if the current URL matches the parser's supported website
    let parser = findParser(url);
    if(parser != null) { // match found
        return await parser.parse(context);
    }

    return await fallbackParser.parse(context);
}

