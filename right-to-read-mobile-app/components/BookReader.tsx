import TableOfContentsSidebar from '@/components/TableOfContentsSidebar';
import TextHighlighter from '@/components/TextHighlighter';
import { ThemedText } from '@/components/ThemedText';
import { useImageLayout } from '@/hooks/useImageLayout';
import { PageSize } from '@/services/coordinateScaler';
import { BlockHighlightData, highlightDataService } from '@/services/highlightDataService';
import { TTSService, TTSServiceCallbacks } from '@/services/ttsService';
import { Book } from '@/types/book';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [isTOCSidebarVisible, setIsTOCSidebarVisible] = useState(false);

  const { sourceImageDimensions, containerDimensions, getRenderedImageSize, getImageOffset, onImageLoad, onImageLayout } = useImageLayout();
  const pageTransition = useRef(new Animated.Value(1)).current;

  const ttsService = useRef<TTSService | null>(null);
  const currentPage = book.pages?.[currentPageIndex];
  const totalPages = book.pages?.length || 0;

  useEffect(() => {
    console.log(`Initializing page ${currentPageIndex + 1} of ${totalPages}`);
    
    // Cleanup previous TTS service
    const cleanupPrevious = async () => {
      if (ttsService.current) {
        await ttsService.current.cleanup();
        ttsService.current = null;
      }
    };

    // Initialize new page
    const initializePage = async () => {
      // Clean up previous instance first
      await cleanupPrevious();
      
      // Reset states for new page
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentBlockIndex(0);
      setCurrentBlockHighlightData(null);
      setCurrentPlaybackPosition(0);

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
          setCurrentBlockIndex(0);
          setCurrentBlockHighlightData(null);
          console.log('Completed reading page content');
        },
        onPlaybackError: (error) => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentBlockIndex(0);
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
              const highlightData = await highlightDataService.getBlockHighlightData(blockId, currentPage.pageNumber);
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

      // Create and initialize new TTS service
      ttsService.current = new TTSService(callbacks);

      if (currentPage?.blocks && ttsService.current) {
        try {
          await ttsService.current.initialize();
          ttsService.current.loadContent(currentPage.blocks);
          console.log(`TTS initialized and loaded ${currentPage.blocks.length} blocks for page ${currentPageIndex + 1}`);
        } catch (error) {
          console.error('Failed to initialize TTS Service:', error);
        }
      }
    };

    initializePage();

    // Cleanup on unmount
    return () => {
      if (ttsService.current) {
        ttsService.current.cleanup();
      }
    };
  }, [currentPageIndex]);

  // Navigation functions
  const handlePreviousPage = () => {
    if (isPageTransitioning || currentPageIndex <= 0) return;
    
    setIsPageTransitioning(true);
    
    // Fade out
    Animated.timing(pageTransition, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPageIndex(currentPageIndex - 1);
      
      // Fade in
      Animated.timing(pageTransition, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsPageTransitioning(false);
      });
    });
  };

  const handleNextPage = () => {
    if (isPageTransitioning || !book?.pages || currentPageIndex >= book.pages.length - 1) return;
    
    setIsPageTransitioning(true);
    
    // Fade out
    Animated.timing(pageTransition, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentPageIndex(currentPageIndex + 1);
      
      // Fade in
      Animated.timing(pageTransition, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsPageTransitioning(false);
      });
    });
  };

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

  const handleTOCNavigation = (targetPageNumber: number) => {
    // Find the page index that corresponds to the target page number
    const targetPageIndex = book.pages?.findIndex(page => page.pageNumber === targetPageNumber);
    
    if (targetPageIndex !== undefined && targetPageIndex !== -1) {
      setCurrentPageIndex(targetPageIndex);
    }
  };

  const handleCloseTOCSidebar = () => {
    setIsTOCSidebarVisible(false);
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
      {/* Floating Back Button */}
      <TouchableOpacity onPress={onClose} style={styles.floatingBackButton}>
        <ThemedText style={styles.backText}>←</ThemedText>
      </TouchableOpacity>

      {/* Floating TOC Button */}
      {book.tableOfContents && book.tableOfContents.length > 0 && (
        <TouchableOpacity 
          onPress={() => setIsTOCSidebarVisible(true)} 
          style={styles.floatingTOCButton}
        >
          <ThemedText style={styles.tocText}>☰</ThemedText>
        </TouchableOpacity>
      )}

      {/* Page Content */}
      <Animated.View style={{ flex: 1, opacity: pageTransition }}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageContainer}>
            <Image
              source={currentPage.image}
              style={styles.pageImage}
              contentFit="contain"
              onLoad={onImageLoad}
              onLayout={onImageLayout}
            />
            
            {/* Text Highlighting Overlay */}
          {currentBlockHighlightData && (() => {
            // Calculate display image size based on full height layout
            // The image takes the full available height (from top to audio controls) and adjusts width maintaining aspect ratio
            const availableHeight = screenHeight - 100; // Only subtract space for audio controls at bottom
            const aspectRatio = ORIGINAL_PAGE_SIZE.width / ORIGINAL_PAGE_SIZE.height;
            
            // Calculate display size - image fills height, width is calculated from aspect ratio
            const displayImageSize = {
              width: availableHeight * aspectRatio,
              height: availableHeight
            };
            
            // If calculated width exceeds screen width, limit by width instead
            if (displayImageSize.width > screenWidth) {
              displayImageSize.width = screenWidth;
              displayImageSize.height = screenWidth / aspectRatio;
            }
            
            // Calculate image offset for centering
            const imageOffset = {
              x: (screenWidth - displayImageSize.width) / 2,
              y: (availableHeight - displayImageSize.height) / 2
            };
            
            console.log(`Using display image size for highlighting: ${displayImageSize.width}x${displayImageSize.height}`);
            console.log(`Original page size: ${ORIGINAL_PAGE_SIZE.width}x${ORIGINAL_PAGE_SIZE.height}`);
            console.log(`Image offset: x=${imageOffset.x}, y=${imageOffset.y}`);
            console.log(`Available height: ${availableHeight}, Screen height: ${screenHeight}, Aspect ratio: ${aspectRatio}`);
            
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
      </Animated.View>

      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <ThemedText style={styles.audioTitle}>Listen to this page:</ThemedText>
        
        {/* All Controls in One Row */}
        <View style={styles.allControlsRow}>
          {/* Audio Control Buttons */}
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

          {/* Page Indicator */}
          <View style={styles.pageIndicatorCenter}>
            <ThemedText style={styles.pageIndicatorText}>
              Page {currentPageIndex + 1} of {book?.pages?.length || 0}
            </ThemedText>
          </View>

          {/* Previous Navigation Button */}
          <TouchableOpacity 
            style={[
              styles.navigationButton, 
              currentPageIndex <= 0 ? styles.disabledButton : styles.enabledButton
            ]} 
            onPress={handlePreviousPage}
            disabled={isPageTransitioning || currentPageIndex <= 0}
          >
            <ThemedText style={[
              styles.navigationButtonText,
              currentPageIndex <= 0 ? styles.disabledText : styles.enabledText
            ]}>
              ← Previous
            </ThemedText>
          </TouchableOpacity>

          {/* Next Navigation Button */}
          <TouchableOpacity 
            style={[
              styles.navigationButton, 
              (!book?.pages || currentPageIndex >= book.pages.length - 1) ? styles.disabledButton : styles.enabledButton
            ]} 
            onPress={handleNextPage}
            disabled={isPageTransitioning || !book?.pages || currentPageIndex >= book.pages.length - 1}
          >
            <ThemedText style={[
              styles.navigationButtonText,
              (!book?.pages || currentPageIndex >= book.pages.length - 1) ? styles.disabledText : styles.enabledText
            ]}>
              Next →
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table of Contents Sidebar */}
      {book.tableOfContents && (
        <TableOfContentsSidebar
          isVisible={isTOCSidebarVisible}
          sections={book.tableOfContents}
          currentPageNumber={currentPage.pageNumber}
          onClose={handleCloseTOCSidebar}
          onSectionPress={handleTOCNavigation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backText: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  floatingTOCButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tocText: {
    fontSize: 20,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  audioControls: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingBottom: 32,
    paddingHorizontal: 26,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 0,
  },
  allControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  controlButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
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
    fontSize: 12,
    fontWeight: '600',
  },
  navigationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  enabledButton: {
    backgroundColor: '#4A90E2',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  navigationButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  enabledText: {
    color: '#fff',
  },
  disabledText: {
    color: '#888',
  },
  pageIndicator: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 20,
  },
  pageIndicatorCenter: {
    alignItems: 'center',
    minWidth: 80,
    marginHorizontal: 8,
  },
  pageIndicatorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});
