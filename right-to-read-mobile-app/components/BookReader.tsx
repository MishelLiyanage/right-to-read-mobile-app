import { ThemedText } from '@/components/ThemedText';
import { Book, TextBlock } from '@/types/book';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);

  const currentPage = book.pages?.[currentPageIndex];

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async (block: TextBlock, blockIndex: number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(block.audio);
      setSound(newSound);
      setCurrentBlockIndex(blockIndex);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentBlockIndex(null);
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setCurrentBlockIndex(null);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      setCurrentBlockIndex(null);
    }
  };

  const playPageAudio = async () => {
    if (!currentPage?.blocks) return;

    for (let i = 0; i < currentPage.blocks.length; i++) {
      await playAudio(currentPage.blocks[i], i);
      // Wait for audio to finish before playing next
      await new Promise(resolve => {
        const checkStatus = () => {
          if (!isPlaying) {
            resolve(void 0);
          } else {
            setTimeout(checkStatus, 100);
          }
        };
        checkStatus();
      });
    }
  };

  const pauseAudio = async () => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  if (!currentPage) {
    return (
      <View style={styles.container}>
        <ThemedText>No content available for this book.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <ThemedText style={styles.backText}>←</ThemedText>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{book.title}</ThemedText>
          <ThemedText style={styles.subtitle}>by {book.author}</ThemedText>
        </View>
        <View style={styles.pageInfo}>
          <ThemedText style={styles.pageNumber}>
            {currentPageIndex + 1} / {book.pages?.length || 1}
          </ThemedText>
        </View>
      </View>

      {/* Page Content */}
      <View style={styles.content}>
        <Image
          source={currentPage.image}
          style={styles.pageImage}
          contentFit="contain"
        />
      </View>

      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <ThemedText style={styles.audioTitle}>Listen to this page:</ThemedText>
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.playButton]} 
            onPress={playPageAudio}
            disabled={isPlaying}
          >
            <ThemedText style={styles.controlButtonText}>▶ Play</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.pauseButton]} 
            onPress={pauseAudio}
            disabled={!isPlaying}
          >
            <ThemedText style={styles.controlButtonText}>⏸ Pause</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]} 
            onPress={stopAudio}
            disabled={!isPlaying}
          >
            <ThemedText style={styles.controlButtonText}>⏹ Stop</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 24,
    color: '#4A90E2',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageImage: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.6,
    borderRadius: 8,
  },
  audioControls: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
