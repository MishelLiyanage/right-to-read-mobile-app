import TextHighlighter from '@/components/TextHighlighter';
import { ThemedText } from '@/components/ThemedText';
import { BlockHighlightData, highlightDataService } from '@/services/highlightDataService';
import { TTSService, TTSServiceCallbacks } from '@/services/ttsService';
import { Book } from '@/types/book';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);
  const [currentBlockHighlightData, setCurrentBlockHighlightData] = useState<BlockHighlightData | null>(null);

  const ttsService = useRef<TTSService | null>(null);
  const currentPage = book.pages?.[currentPageIndex];

  useEffect(() => {
    // Initialize TTS Service with callbacks
    const callbacks: TTSServiceCallbacks = {
      onPlaybackStart: () => {
        setIsPlaying(true);
        console.log('Started reading page content');
      },
      onPlaybackComplete: () => {
        setIsPlaying(false);
        setCurrentBlockIndex(-1);
        setCurrentBlockHighlightData(null);
        console.log('Completed reading page content');
      },
      onPlaybackError: (error) => {
        setIsPlaying(false);
        setCurrentBlockIndex(-1);
        setCurrentBlockHighlightData(null);
        Alert.alert('Playback Error', error);
        console.error('TTS Error:', error);
      },
      onBlockStart: async (blockIndex, text) => {
        setCurrentBlockIndex(blockIndex);
        console.log(`Reading block ${blockIndex + 1}: "${text}"`);
        
        // Load highlighting data for current block
        const blockId = currentPage?.blocks?.[blockIndex]?.id;
        if (blockId) {
          try {
            const highlightData = await highlightDataService.getBlockHighlightData(blockId);
            setCurrentBlockHighlightData(highlightData);
          } catch (error) {
            console.error('Failed to load highlight data:', error);
          }
        }
      },
      onBlockComplete: (blockIndex) => {
        console.log(`Completed block ${blockIndex + 1}`);
      },
      onPlaybackProgress: (position, duration, blockIndex) => {
        setCurrentPlaybackPosition(position);
      }
    };

    ttsService.current = new TTSService(callbacks);

    // Load page content
    if (currentPage?.blocks) {
      ttsService.current.loadContent(currentPage.blocks);
      console.log(`Loaded ${currentPage.blocks.length} blocks for reading`);
    }

    // Cleanup on unmount
    return () => {
      ttsService.current?.cleanup();
    };
  }, [currentPageIndex]);

  const handlePlayPage = async () => {
    if (!ttsService.current || !currentPage?.blocks) {
      Alert.alert('Error', 'No content available to read');
      return;
    }

    try {
      await ttsService.current.startReading();
    } catch (error) {
      console.error('Error starting TTS:', error);
      Alert.alert('Error', 'Failed to start reading');
    }
  };

  const handleStopReading = async () => {
    if (ttsService.current) {
      await ttsService.current.stop();
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
        
        {/* Text Highlighting Overlay */}
        {currentBlockHighlightData && (
          <TextHighlighter
            blockData={{
              id: currentBlockHighlightData.blockId,
              text: currentBlockHighlightData.text,
              words: currentBlockHighlightData.words,
              bounding_boxes: currentBlockHighlightData.bounding_boxes
            }}
            speechMarks={currentBlockHighlightData.speechMarks}
            isPlaying={isPlaying}
            currentTime={currentPlaybackPosition}
            imageWidth={1024} // Replace with actual image dimensions
            imageHeight={768} // Replace with actual image dimensions
            onWordHighlight={(wordIndex, word) => {
              console.log(`Highlighting word ${wordIndex}: ${word}`);
            }}
          />
        )}
      </View>

      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <ThemedText style={styles.audioTitle}>Listen to this page:</ThemedText>
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.playButton]} 
            onPress={handlePlayPage}
            disabled={isPlaying}
          >
            <ThemedText style={styles.controlButtonText}>
              {isPlaying ? '▶ Reading...' : '▶ Play'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]} 
            onPress={handleStopReading}
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
  stopButton: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
