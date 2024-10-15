import getClient from "../getClient.js";

export async function createAssistant(body, options) {
    let openai = getClient();
    let assistant = await openai.beta.assistants.create(
        Object.assign(defaultAssistantBody, body ?? {}),
        options
    );
    return assistant;
}

export async function getDefaultAssistant() {
    if(Storage.defaultAssistant) return Storage.defaultAssistant;
    let assistant = await createAssistant();
    Storage.defaultAssistant = assistant;
    return assistant;
}
class Storage {
    static defaultAssistant = null;
}

const defaultAssistantBody = { model: "gpt-4o-mini" }
