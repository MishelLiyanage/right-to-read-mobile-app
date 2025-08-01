import { TextBlock } from '@/types/book';
import { Audio, AVPlaybackStatus } from 'expo-av';

export interface TTSServiceCallbacks {
  onPlaybackStart?: () => void;
  onPlaybackComplete?: () => void;
  onPlaybackError?: (error: string) => void;
  onBlockStart?: (blockIndex: number, text: string) => void;
  onBlockComplete?: (blockIndex: number) => void;
  onPlaybackProgress?: (position: number, duration: number, blockIndex: number) => void;
}

export class TTSService {
  private currentSound: Audio.Sound | null = null;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private currentBlockIndex: number = 0;
  private blocks: TextBlock[] = [];
  private callbacks: TTSServiceCallbacks = {};
  private isInitialized: boolean = false;

  constructor(callbacks?: TTSServiceCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  setCallbacks(callbacks: TTSServiceCallbacks) {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<void> {
    try {
      // Set audio mode for optimal playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('TTS Service initialized');
    } catch (error) {
      console.error('TTS Service initialization failed:', error);
      this.callbacks.onPlaybackError?.(`Initialization failed: ${error}`);
    }
  }

  loadContent(blocks: TextBlock[]): void {
    this.blocks = blocks;
    this.currentBlockIndex = 0;
    console.log(`TTS Service: Loaded ${blocks.length} blocks`);
  }

  async startReading(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.blocks.length === 0) {
      this.callbacks.onPlaybackError?.('No content to read');
      return;
    }

    try {
      // If resuming from pause, don't reset block index
      if (!this.isPaused) {
        this.currentBlockIndex = 0;
      }
      
      this.isPlaying = true;
      this.isPaused = false;
      
      this.callbacks.onPlaybackStart?.();
      
      await this.playSequentially();
      
    } catch (error) {
      console.error('TTS Service: Error starting reading:', error);
      this.callbacks.onPlaybackError?.(`Failed to start reading: ${error}`);
      this.isPlaying = false;
    }
  }

  private async playSequentially(): Promise<void> {
    for (let i = this.currentBlockIndex; i < this.blocks.length; i++) {
      if (!this.isPlaying) break;
      
      this.currentBlockIndex = i;
      const block = this.blocks[i];
      
      this.callbacks.onBlockStart?.(i, block.text);
      
      await this.playBlock(block);
      
      // Wait for block to complete (this will wait during pause)
      await this.waitForCompletion();
      
      if (!this.isPlaying) break;
      
      this.callbacks.onBlockComplete?.(i);
    }
    
    if (this.isPlaying && !this.isPaused) {
      this.isPlaying = false;
      this.callbacks.onPlaybackComplete?.();
    }
  }

  private async playBlock(block: TextBlock): Promise<void> {
    try {
      console.log(`Playing: "${block.text}"`);
      
      // Cleanup previous sound
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(block.audio);
      this.currentSound = sound;

      // Set up playback status monitoring
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            console.log(`Completed: "${block.text}"`);
          } else if (status.positionMillis !== undefined && status.durationMillis !== undefined) {
            // Provide real-time progress updates
            this.callbacks.onPlaybackProgress?.(
              status.positionMillis,
              status.durationMillis,
              this.currentBlockIndex
            );
          }
        }
      });

      await sound.playAsync();
      
    } catch (error) {
      console.error('Error playing block:', error);
      this.callbacks.onPlaybackError?.(`Failed to play audio: ${error}`);
      throw error;
    }
  }

  private async waitForCompletion(): Promise<void> {
    return new Promise((resolve) => {
      const checkStatus = async () => {
        if (!this.currentSound || !this.isPlaying) {
          resolve();
          return;
        }

        // If paused, keep waiting without resolving
        if (this.isPaused) {
          setTimeout(checkStatus, 100);
          return;
        }

        try {
          const status = await this.currentSound.getStatusAsync();
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          } else if (status.isLoaded && !status.isPlaying && !this.isPaused) {
            resolve();
          } else {
            setTimeout(checkStatus, 100);
          }
        } catch (error) {
          console.error('Error checking status:', error);
          resolve();
        }
      };
      checkStatus();
    });
  }

  async stop(): Promise<void> {
    try {
      this.isPlaying = false;
      this.isPaused = false;
      
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      
      this.currentBlockIndex = 0;
      console.log('TTS Service: Stopped');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  async pause(): Promise<void> {
    try {
      if (this.currentSound && this.isPlaying && !this.isPaused) {
        await this.currentSound.pauseAsync();
        this.isPaused = true;
        console.log('TTS Service: Paused');
      }
    } catch (error) {
      console.error('Error pausing TTS:', error);
    }
  }

  async resume(): Promise<void> {
    try {
      if (this.currentSound && this.isPlaying && this.isPaused) {
        await this.currentSound.playAsync();
        this.isPaused = false;
        console.log('TTS Service: Resumed');
      }
    } catch (error) {
      console.error('Error resuming TTS:', error);
    }
  }

  async cleanup(): Promise<void> {
    await this.stop();
    this.isPaused = false;
  }

  // Status getters
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  getCurrentBlockIndex(): number {
    return this.currentBlockIndex;
  }

  getTotalBlocks(): number {
    return this.blocks.length;
  }
}
