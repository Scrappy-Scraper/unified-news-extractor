import _Parser from "./_Parser.js";
import Reuters from "./Reuters.js";
import ABCNews from "./ABCNews.js";
import fallback from "./fallback.js";

const parsers = {
    Reuters: new Reuters(),
    ABCNews: new ABCNews(),
} as { [key: string]: _Parser };

export default parsers;

const fallbackParser = new fallback();
export { fallbackParser };

export function findParser(url: string): _Parser | null {
    let parserNames = Object.keys(parsers);
    for (let ind = 0; ind < parserNames.length; ind++) {
        let parser = parsers[parserNames[ind]];
        if (parser.isAcceptedWebsite(url)) { // match found
            return parser;
        }
    }
    return null; // no matching parser found
}
