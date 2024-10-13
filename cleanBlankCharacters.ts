export function cleanBlankCharacters(text: string): string {
    return text.replace(/(\r\n|\n|\r|\u00a0)/gm, " ").replace(/\s\s+/g, ' ').trim()
}
