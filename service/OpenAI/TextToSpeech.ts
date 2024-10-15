import {SpeechModel} from "openai/src/resources/audio/speech";
import getClient from "./getClient";

export default class TextToSpeech {
    public model: SpeechModel = "tts-1";
    public voice: VoiceActor|null = null;
    public audioFormat: AudioFormat = "mp3";

    async makeSpeech(text: string): Promise<{dataUrl: string, arrayBuffer: ArrayBuffer, voice: VoiceActor, model: SpeechModel, format: AudioFormat}> {
        let openai = getClient();
        let model = this.model;
        let voice = this.voice ?? availableVoiceActors[Math.floor(Math.random() * availableVoiceActors.length)]; // if no voice provided, randomly choose one
        let format = this.audioFormat;

        let response = await openai.audio.speech.create({
            model: model,
            voice: voice,
            input: text,
            response_format: format,
        })
        let arrayBuffer: ArrayBuffer = await response.arrayBuffer();

        let byteArray = new Uint8Array(arrayBuffer);

        let data = '';
        for (let i = 0; i < byteArray.byteLength; i++) {
            data += String.fromCharCode(byteArray[i]);
        }
        let audioDataUrl = 'data:' + getContentType(format) + ';base64,' + btoa(data);

        return {
            dataUrl: audioDataUrl,
            arrayBuffer,
            voice,
            model,
            format,
        }
    }
}

function getContentType(format: AudioFormat) {
    switch (format) {
        case'mp3':
            return 'audio/mpeg';
        case 'opus':
            return 'audio/opus';
        case 'aac':
            return 'audio/aac';
        case 'flac':
            return 'audio/flac';
        case 'wav':
            return 'audio/wav';
        case 'pcm':
            return 'audio/pcm';
        default:
            return `audio/${format}`;
    }
}

type AudioFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
type VoiceActor = "alloy"|"echo"|"fable"|"onyx"|"nova"|"shimmer";
export const availableVoiceActors: VoiceActor[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
