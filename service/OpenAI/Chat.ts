import {createThread, Thread, ThreadCreateParams} from "./models/Thread.js";
import Assistant, {getDefaultAssistant} from "./models/Assistant.js";
import RequestOptions from "./models/RequestOptions.js";
import {createMessage, Message} from "./models/Message.js";
import createRun, {getReplyFromRun, RunCreateParamsNonStreaming} from "./models/Run.js";
import * as ChatAPI from "openai/src/resources/chat/chat";

export default class Chat {
    private thread: Thread;
    private assistant: Assistant;
    private requestOptions?: RequestOptions;

    static async create(body?: ThreadCreateParams, requestOptions?: RequestOptions): Promise<Chat> {
        let thread = await createThread(body, requestOptions);
        let assistant = await getDefaultAssistant();

        return new Chat(thread, assistant, requestOptions);
    }

    async addUserMessage(message: string): Promise<Message> {
        return await createMessage(
            this.thread.id,
            { role: "user", content: message },
            this.requestOptions
        )
    }
    async addAssistantMessage(message: string): Promise<Message> {
        return await createMessage(
            this.thread.id,
            { role: "assistant", content: message },
            this.requestOptions
        )
    }

    setAssistantModel(model: ChatAPI.ChatModel): Chat {
        this.assistant.model = model;
        return this;
    }

    async submit(
        body?: Omit<Partial<RunCreateParamsNonStreaming>, "stream">,
    ) {
        let run = await createRun(
            this.thread.id,
            Object.assign({assistant_id: this.assistant.id}, body ?? {}),
            this.requestOptions
        );
        return await getReplyFromRun(this.thread.id, {run_id: run.id}, this.requestOptions);
    }

    private constructor(thread: Thread, assistant: Assistant, options?: RequestOptions) {
        this.thread = thread;
        this.assistant = assistant;
        this.requestOptions = options;
    }
    setAssistant(assistant: Assistant): Chat { this.assistant = assistant; return this; }
    setRequestOptions(options: RequestOptions): Chat { this.requestOptions = options; return this; }
}
