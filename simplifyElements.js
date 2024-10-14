import cleanBlankCharacters from "./cleanBlankCharacters.js";

export function simplifyElements($) {
    $("html").find("iframe").remove();
    $("html").find("style").remove();
    $("html").find("script").remove();
    $("html").find("svg").remove();
    $("html").find("form").remove();
    $("html").find("input").remove();
    $("html").find("*").get().forEach((element) => {
        element.attributes.forEach((attribute) => {
            let attributeName = attribute.name;
            if (
                !(element.tagName == "img" && attributeName == "src") &&
                !(element.tagName == "a" && attributeName == "href")
            ) {
                $(element).removeAttr(attribute.name)
            }
        })
    });
    $("html").get().forEach((element) => {
        element.attributes.forEach((attribute) => {
            $(element).removeAttr(attribute.name)
        })
    });

    // remove html comments
    $('*').contents().each(function (index, node) {
        if (node.nodeType === 8) { // comment node: Node.COMMENT_NODE
            $(node).remove();
        }
    });

    // remove empty tags
    let shouldCheckForEmpty = true;
    let attemptCount = 0;
    while (shouldCheckForEmpty && attemptCount < 10) {
        let removalCount = 0;
        let hasChanged = false;
        $("html").find("*").get().forEach((element) => {
            removeBlankTextNodes($, element);
            element.children.forEach((child) => {
                if (child.nodeType === 3) {
                    let currentText = child.nodeValue;
                    let cleanedText = cleanBlankCharacters(currentText);
                    if (cleanedText != currentText) {
                        child.nodeValue = cleanedText;
                        hasChanged = true;
                    }
                }
            })
            if (element.tagName != "img" && $(element).is(":empty")) {
                $(element).remove();
                removalCount++;
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
        $("html").find("*").get().forEach((element) => {
            if (["span", "div", "p", "a"].indexOf(element.tagName) == -1) return; // only strip "span", "div", "p", and "a
            let children = element.children;
            if (children.length != 1 || children[0].nodeType != 3) return; // current node should have exactly one child, and the child should be a text node
            if ((element.parent?.children ?? []).length > 1) return; // the parent should have only one child, which is the current node
            let child = children[0];
            let text = cleanBlankCharacters($(child).text());
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

function removeBlankTextNodes($, element) {
    $(element).contents().filter((index, node) => {
        return node.nodeType === 3 && !/\S/.test(node.nodeValue.replace(/(\r\n|\n|\r|\u00a0)/gm, " "))
    }).remove();
}
