import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface SpeechMark {
  time: number;
  type: string;
  start: number;
  end: number;
  value: string;
}

interface BlockData {
  id: number;
  text: string;
  words: string[];
  bounding_boxes: number[][][];
}

interface TextHighlighterProps {
  blockData: BlockData;
  speechMarks: SpeechMark[];
  isPlaying: boolean;
  currentTime: number;
  imageWidth: number;
  imageHeight: number;
  onWordHighlight?: (wordIndex: number, word: string) => void;
}

export default function TextHighlighter({
  blockData,
  speechMarks,
  isPlaying,
  currentTime,
  imageWidth,
  imageHeight,
  onWordHighlight
}: TextHighlighterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate scale factors for coordinate mapping
  const scaleX = screenWidth / imageWidth;
  const scaleY = screenHeight / imageHeight;

  useEffect(() => {
    if (!isPlaying || !speechMarks.length) {
      setCurrentWordIndex(-1);
      return;
    }

    // Find current word based on timing
    let wordIndex = -1;
    for (let i = 0; i < speechMarks.length; i++) {
      if (currentTime >= speechMarks[i].time) {
        wordIndex = i;
      } else {
        break;
      }
    }

    if (wordIndex !== currentWordIndex) {
      setCurrentWordIndex(wordIndex);
      if (wordIndex >= 0 && onWordHighlight) {
        onWordHighlight(wordIndex, speechMarks[wordIndex].value);
      }
    }
  }, [currentTime, isPlaying, speechMarks, currentWordIndex, onWordHighlight]);

  const renderWordHighlights = () => {
    if (!blockData.bounding_boxes || !speechMarks.length) return null;

    return speechMarks.map((speechMark, index) => {
      const isCurrentWord = index === currentWordIndex;
      const isPassedWord = index < currentWordIndex;
      
      // Get bounding box for this word
      const boundingBox = blockData.bounding_boxes[index];
      if (!boundingBox || !boundingBox[0]) return null;

      // Extract coordinates and scale them
      const [topLeft, bottomRight] = boundingBox;
      const left = topLeft[0] * scaleX;
      const top = topLeft[1] * scaleY;
      const width = (bottomRight[0] - topLeft[0]) * scaleX;
      const height = (bottomRight[1] - topLeft[1]) * scaleY;

      return (
        <View
          key={`word-${index}-${speechMark.value}`}
          style={[
            styles.wordHighlight,
            {
              left,
              top,
              width,
              height,
              backgroundColor: isCurrentWord 
                ? 'rgba(255, 255, 0, 0.7)' // Bright yellow for current word
                : isPassedWord 
                  ? 'rgba(0, 255, 0, 0.3)' // Light green for completed words
                  : 'rgba(0, 0, 255, 0.2)', // Light blue for upcoming words
              borderColor: isCurrentWord ? '#FFD700' : 'transparent',
              borderWidth: isCurrentWord ? 2 : 0,
            }
          ]}
        />
      );
    });
  };

  const renderBlockHighlight = () => {
    if (!blockData.bounding_boxes || !blockData.bounding_boxes.length) return null;

    // Calculate overall block bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    blockData.bounding_boxes.forEach(wordBox => {
      if (wordBox && wordBox[0] && wordBox[1]) {
        const [topLeft, bottomRight] = wordBox;
        minX = Math.min(minX, topLeft[0]);
        minY = Math.min(minY, topLeft[1]);
        maxX = Math.max(maxX, bottomRight[0]);
        maxY = Math.max(maxY, bottomRight[1]);
      }
    });

    if (minX === Infinity) return null;

    const left = minX * scaleX;
    const top = minY * scaleY;
    const width = (maxX - minX) * scaleX;
    const height = (maxY - minY) * scaleY;

    return (
      <View
        style={[
          styles.blockHighlight,
          {
            left: left - 5,
            top: top - 5,
            width: width + 10,
            height: height + 10,
            borderColor: isPlaying ? '#FF6B6B' : '#E0E0E0',
            backgroundColor: isPlaying ? 'rgba(255, 107, 107, 0.1)' : 'rgba(224, 224, 224, 0.1)',
          }
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderBlockHighlight()}
      {renderWordHighlights()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  blockHighlight: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  wordHighlight: {
    position: 'absolute',
    borderRadius: 2,
  },
});
