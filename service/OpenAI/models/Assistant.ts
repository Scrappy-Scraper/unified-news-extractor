import {Assistant as OpenAIAssistant, AssistantCreateParams} from "openai/src/resources/beta/assistants";
import RequestOptions from "./RequestOptions.js";
import getClient from "../getClient.js";

export default interface Assistant extends OpenAIAssistant {}

export async function createAssistant(body?: Partial<AssistantCreateParams>, options?: RequestOptions): Promise<Assistant> {
    let openai = getClient();
    let assistant = await openai.beta.assistants.create(
        Object.assign(defaultAssistantBody, body ?? {}),
        options
    );
    return assistant;
}

export async function getDefaultAssistant(): Promise<Assistant> {
    if(Storage.defaultAssistant) return Storage.defaultAssistant;
    let assistant = await createAssistant();
    Storage.defaultAssistant = assistant;
    return assistant;
}
class Storage {
    static defaultAssistant: Assistant | null = null;
}

const defaultAssistantBody: AssistantCreateParams = { model: "gpt-4o-mini" }
