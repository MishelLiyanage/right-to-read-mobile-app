import TableOfContents from '@/components/TableOfContents';
import { TableOfContentsSection } from '@/types/book';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface TableOfContentsSidebarProps {
  isVisible: boolean;
  sections: TableOfContentsSection[];
  currentPageNumber: number;
  onClose: () => void;
  onSectionPress: (pageNumber: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 320;

export default function TableOfContentsSidebar({ 
  isVisible, 
  sections, 
  currentPageNumber, 
  onClose, 
  onSectionPress 
}: TableOfContentsSidebarProps) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Show sidebar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide sidebar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, backdropAnim]);

  const handleSectionPress = (pageNumber: number) => {
    onSectionPress(pageNumber);
    onClose(); // Close sidebar after navigation
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.sidebarContent}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeButtonContent}>
                <View style={[styles.closeIcon, { transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.closeIcon, { transform: [{ rotate: '-45deg' }] }]} />
              </View>
            </TouchableOpacity>

            {/* Table of Contents */}
            <TableOfContents
              sections={sections}
              currentPageNumber={currentPageNumber}
              onSectionPress={handleSectionPress}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonContent: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  closeIcon: {
    width: 12,
    height: 2,
    backgroundColor: '#666',
    position: 'absolute',
  },
});