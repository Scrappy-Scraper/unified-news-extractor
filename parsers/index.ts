import _Parser from "./_Parser.js";
import Reuters from "./Reuters.js";
import ABCNews from "./ABCNews.js";

const Parsers = {
    Reuters: new Reuters(),
    ABCNews: new ABCNews(),
} as { [key: string]: _Parser };

export default Parsers;
