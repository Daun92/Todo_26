// ============================================
// Audio Recording Utility
// For voice input to Gemini Live API
// ============================================

export interface AudioRecorderCallbacks {
  onDataAvailable?: (audioData: ArrayBuffer) => void;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: Error) => void;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private callbacks: AudioRecorderCallbacks = {};
  private isRecording = false;

  constructor(callbacks?: AudioRecorderCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  setCallbacks(callbacks: AudioRecorderCallbacks) {
    this.callbacks = callbacks;
  }

  async start(): Promise<boolean> {
    if (this.isRecording) {
      return true;
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create audio context for raw PCM data
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Process audio in chunks
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputData = event.inputBuffer.getChannelData(0);
        const pcmData = this.floatTo16BitPCM(inputData);
        this.callbacks.onDataAvailable?.(pcmData.buffer as ArrayBuffer);
      };

      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
      this.callbacks.onStart?.();

      return true;
    } catch (error) {
      console.error('[AudioRecorder] Failed to start:', error);
      this.callbacks.onError?.(error as Error);
      return false;
    }
  }

  stop() {
    this.isRecording = false;

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.callbacks.onStop?.();
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

// ============================================
// Audio Playback Utility
// For playing Gemini's audio responses
// ============================================

export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async play(audioData: ArrayBuffer, sampleRate: number = 24000): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    try {
      // Convert PCM to AudioBuffer
      const audioBuffer = await this.createAudioBuffer(audioData, sampleRate);
      this.audioQueue.push(audioBuffer);

      if (!this.isPlaying) {
        this.playNext();
      }
    } catch (error) {
      console.error('[AudioPlayer] Failed to play audio:', error);
    }
  }

  private async createAudioBuffer(
    audioData: ArrayBuffer,
    sampleRate: number
  ): Promise<AudioBuffer> {
    const int16Array = new Int16Array(audioData);
    const float32Array = new Float32Array(int16Array.length);

    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = this.audioContext!.createBuffer(
      1,
      float32Array.length,
      sampleRate
    );
    audioBuffer.getChannelData(0).set(float32Array);

    return audioBuffer;
  }

  private playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;

    this.currentSource = this.audioContext!.createBufferSource();
    this.currentSource.buffer = audioBuffer;
    this.currentSource.connect(this.audioContext!.destination);

    this.currentSource.onended = () => {
      this.playNext();
    };

    this.currentSource.start();
  }

  stop() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Check if browser supports required APIs
export function checkAudioSupport(): { supported: boolean; reason?: string } {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: 'MediaDevices API not supported' };
  }

  if (!window.AudioContext) {
    return { supported: false, reason: 'AudioContext not supported' };
  }

  return { supported: true };
}
