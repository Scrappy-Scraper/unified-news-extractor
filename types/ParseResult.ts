type ParseResult =
{
    success: true,
    type: "article", // an article is a single piece of news, a collection is a group of articles
    pageTitle: string,
    url: string,
    articleTitle: string,
    paragraphs: string[],
    images: {
        url: string,
    }[],
} |
{
    success: true,
    type: "collection",
    url: string,
    articles: {url: string}[]
} |
{
    success: false,
    url: string,
    errorCode: "parseFailed"|"unsupported",
    errorMessage: string,
    html: string,
    images: {
        url: string,
    }[],
}
export default ParseResult;
