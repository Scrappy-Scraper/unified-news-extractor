import OpenAI from "openai";

export default function getClient(apiKey?: string): OpenAI {
    if((apiKey ?? "") == "" && Storage.defaultClient != null) return Storage.defaultClient!;

    let key = apiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if(!key) throw new Error("Missing OpenAI API key");

    if (Storage.instances.has(key)) {
        return Storage.instances.get(key)!;
    }

    let client = new OpenAI({
        apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    });
    Storage.instances.set(key, client);
    return client;
}

export function setDefaultClient(apiKey: string): OpenAI {
    if(Storage.instances.has(apiKey)) {
        let instance = Storage.instances.get(apiKey)!;
        Storage.defaultClient = instance;
        return instance;
    }

    let client = new OpenAI({apiKey});
    Storage.instances.set(apiKey, client);
    Storage.defaultClient = client;
    return client;
}

class Storage {
    public static defaultClient: OpenAI | null = null;
    public static instances: Map<string, OpenAI> = new Map<string, OpenAI>();
}
