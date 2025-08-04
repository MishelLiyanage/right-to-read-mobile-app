import TextHighlighter from '@/components/TextHighlighter';
import { ThemedText } from '@/components/ThemedText';
import { useImageLayout } from '@/hooks/useImageLayout';
import { PageSize } from '@/services/coordinateScaler';
import { BlockHighlightData, highlightDataService } from '@/services/highlightDataService';
import { TTSService, TTSServiceCallbacks } from '@/services/ttsService';
import { Book } from '@/types/book';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Original page dimensions based on coordinate analysis
const ORIGINAL_PAGE_SIZE: PageSize = { width: 612, height: 774 };

export default function BookReader({ book, onClose }: BookReaderProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(-1);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);
  const [currentBlockHighlightData, setCurrentBlockHighlightData] = useState<BlockHighlightData | null>(null);

  const { sourceImageDimensions, containerDimensions, getRenderedImageSize, getImageOffset, onImageLoad, onImageLayout } = useImageLayout();

  const ttsService = useRef<TTSService | null>(null);
  const currentPage = book.pages?.[currentPageIndex];

  useEffect(() => {
    // Initialize TTS Service with callbacks
    const callbacks: TTSServiceCallbacks = {
      onPlaybackStart: () => {
        setIsPlaying(true);
        setIsPaused(false);
        console.log('Started reading page content');
      },
      onPlaybackComplete: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentBlockIndex(-1);
        setCurrentBlockHighlightData(null);
        console.log('Completed reading page content');
      },
      onPlaybackError: (error) => {
        setIsPlaying(false);
        setIsPaused(false);
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
      if (isPaused) {
        // Resume if paused
        await ttsService.current.resume();
        setIsPaused(false);
        console.log('Resumed reading from pause');
      } else if (!isPlaying) {
        // Start from beginning if not playing
        await ttsService.current.startReading();
        console.log('Started reading from beginning');
      }
    } catch (error) {
      console.error('Error with play/resume:', error);
      Alert.alert('Error', 'Failed to start/resume reading');
    }
  };

  const handlePauseReading = async () => {
    if (ttsService.current && isPlaying && !isPaused) {
      try {
        await ttsService.current.pause();
        setIsPaused(true);
        console.log('Paused reading');
      } catch (error) {
        console.error('Error pausing TTS:', error);
        Alert.alert('Error', 'Failed to pause reading');
      }
    }
  };

  const handleStopReading = async () => {
    if (ttsService.current) {
      await ttsService.current.stop();
      setIsPlaying(false);
      setIsPaused(false);
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
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={currentPage.image}
            style={styles.pageImage}
            contentFit="cover"
            onLoad={onImageLoad}
            onLayout={onImageLayout}
          />
          
          {/* Text Highlighting Overlay */}
          {currentBlockHighlightData && (() => {
            // Use full screen width and calculated height based on aspect ratio
            const displayImageSize = {
              width: screenWidth,
              height: screenWidth / (ORIGINAL_PAGE_SIZE.width / ORIGINAL_PAGE_SIZE.height)
            };
            const imageOffset = { x: 0, y: 0 }; // No offset since we're using full width
            
            console.log(`Using display image size for highlighting: ${displayImageSize.width}x${displayImageSize.height}`);
            console.log(`Original page size: ${ORIGINAL_PAGE_SIZE.width}x${ORIGINAL_PAGE_SIZE.height}`);
            console.log(`Image offset: x=${imageOffset.x}, y=${imageOffset.y}`);
            
            return (
              <TextHighlighter
                blockData={{
                  id: currentBlockHighlightData.blockId,
                  text: currentBlockHighlightData.text,
                  words: currentBlockHighlightData.words,
                  bounding_boxes: currentBlockHighlightData.bounding_boxes
                }}
                speechMarks={currentBlockHighlightData.speechMarks}
                isPlaying={isPlaying && !isPaused}
                currentTime={currentPlaybackPosition}
                originalPageSize={ORIGINAL_PAGE_SIZE}
                renderedImageSize={displayImageSize}
                imageOffset={imageOffset}
                onWordHighlight={(wordIndex, word) => {
                  console.log(`Highlighting word ${wordIndex}: ${word}`);
                }}
              />
            );
          })()}
        </View>
      </ScrollView>

      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <ThemedText style={styles.audioTitle}>Listen to this page:</ThemedText>
        <View style={styles.controlButtons}>
          <TouchableOpacity 
            style={[
              styles.controlButton, 
              isPaused 
                ? styles.resumeButton 
                : isPlaying 
                  ? styles.pauseButton 
                  : styles.playButton
            ]} 
            onPress={isPaused ? handlePlayPage : isPlaying ? handlePauseReading : handlePlayPage}
            disabled={false}
          >
            <ThemedText style={styles.controlButtonText}>
              {isPaused 
                ? '▶ Resume' 
                : isPlaying 
                  ? '⏸ Pause' 
                  : '▶ Play'
              }
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.stopButton]} 
            onPress={handleStopReading}
            disabled={!isPlaying && !isPaused}
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
    paddingHorizontal: 10,
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    width: screenWidth,
  },
  pageImage: {
    width: screenWidth,
    aspectRatio: ORIGINAL_PAGE_SIZE.width / ORIGINAL_PAGE_SIZE.height,
  },
  audioControls: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resumeButton: {
    backgroundColor: '#2196F3',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
