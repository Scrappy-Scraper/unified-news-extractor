import parsers from './parsers/index.js';
import ParseResult from "./types/ParseResult.js";
import _Parser from "./parsers/_Parser.js";
import {ContextData} from "./types/ContextData.js";
import {CheerioAPI} from "cheerio/lib/load.js";
import {Element} from "domhandler/lib/node.js";

export default async function parse(context: ContextData): Promise<ParseResult> {
    let {request, page, parseWithCheerio} = context;
    let url = request.loadedUrl;
    let parserNames = Object.keys(parsers);
    for(let ind = 0; ind < parserNames.length; ind++) {
        let parser: _Parser = parsers[parserNames[ind]];
        if(parser.isAcceptedWebsite(url)) {
            return await parser.parse(context);
        }
    }


    let $ = await parseWithCheerio();
    let images = $("img").map((_ind, img) => {
        return {
            url: $(img).attr("src")?? "",
        };
    }).get();
    return {
        success: false,
        url,
        errorCode: "unsupported",
        errorMessage: `Unsupported website: ${url}`,
        html: simplifyElements($).html(),
        images
    } as ParseResult;
}

function simplifyElements($: CheerioAPI): CheerioAPI {
    $("html").find("iframe").remove();
    $("html").find("style").remove();
    $("html").find("script").remove();
    $("html").find("svg").remove();
    $("html").find("form").remove();
    $("html").find("input").remove();
    $("html").find("*").get().forEach((element: Element) => {
        element.attributes.forEach((attribute: Attribute) => {
            let attributeName = attribute.name;
            if(!(element.tagName == "img" && attributeName == "src")) {
                $(element).removeAttr(attribute.name)
            }
        })
    });
    $("html").get().forEach((element: Element) => {element.attributes.forEach((attribute: Attribute) => {$(element).removeAttr(attribute.name)})});

    // remove html comments
    $('*').contents().each(function(_: number, node: Element) {
        if(node.nodeType === 8) { // comment node: Node.COMMENT_NODE
            $(node).remove();
        }
    });

    // remove empty tags
    let shouldCheckForEmpty = true;
    let attemptCount = 0;
    while (shouldCheckForEmpty && attemptCount < 10) {
        let hasChanged = false;
        $("html").find("*").get().forEach((element: Element) => {
            cleanWhiteSpaces($, element);
            if(
                element.tagName != "img" &&
                (
                    (
                        $(element).children().get().length === 0 &&
                        $(element).text().replace(/(\r\n|\n|\r)/gm, "").trim() === ""
                    ) ||
                    (
                        $(element).is(":empty")
                    )
                )
            ) {
                $(element).remove();
                hasChanged = true;
            } else if(element.children.length == 1 && element.children[0].nodeType == 3) {
                $(element).text($(element).text().replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, ' ').trim());
                hasChanged = true;
            }
        });
        shouldCheckForEmpty = hasChanged;
        attemptCount++;
    }

    // reduce DOM layers
    let shouldCheckForShallow = true;
    attemptCount = 0;
    while (shouldCheckForShallow && attemptCount < 10) {
        let hasChanged = false;
        $("html").find("*").get().forEach((element: Element) => {
            if(["span", "div", "p", "a"].indexOf(element.tagName) == -1) return; // only strip "span", "div", "p", and "a
            let children = element.children;
            if(children.length != 1 || children[0].nodeType != 3) return; // current node should have exactly one child, and the child should be a text node
            if((element.parent?.children ?? []).length > 1) return; // the parent should have only one child, which is the current node
            let child = children[0];
            let text = $(child).text().replace(/(\r\n|\n|\r)/gm, " ").replace(/\s\s+/g, ' ').trim();
            let parent = element.parent;
            $(element).remove();
            $(parent).text(text);
            hasChanged = true;
        })

        shouldCheckForShallow = hasChanged;
        attemptCount++;
    }
    return $;
}

function cleanWhiteSpaces($: CheerioAPI, element: Element) {
    $(element).contents().filter((index: number, node: Element) => {
        return node.nodeType === 3
    })
}

interface Attribute {
    name: string;
    value: string;
    namespace?: string;
    prefix?: string;
}
