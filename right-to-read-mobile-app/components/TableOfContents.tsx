import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TableOfContentsSection } from '@/types/book';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TableOfContentsProps {
  sections: TableOfContentsSection[];
  currentPageNumber: number;
  onSectionPress: (pageNumber: number) => void;
}

export default function TableOfContents({ sections, currentPageNumber, onSectionPress }: TableOfContentsProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Table of Contents</ThemedText>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sections.map((section) => {
          const isCurrentSection = section.pageNumber === currentPageNumber;
          
          return (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionItem,
                isCurrentSection && styles.currentSectionItem
              ]}
              onPress={() => onSectionPress(section.pageNumber)}
              activeOpacity={0.7}
            >
              <View style={styles.sectionContent}>
                <ThemedText style={[
                  styles.sectionTitle,
                  isCurrentSection && styles.currentSectionTitle
                ]}>
                  {section.title}
                </ThemedText>
                
                <ThemedText style={[
                  styles.pageNumber,
                  isCurrentSection && styles.currentPageNumber
                ]}>
                  Page {section.pageNumber}
                </ThemedText>
              </View>
              
              {isCurrentSection && <View style={styles.currentIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sectionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  currentSectionItem: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentSectionTitle: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  pageNumber: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 6,
  },
  currentPageNumber: {
    color: '#4A90E2',
    opacity: 1,
    fontWeight: '600',
  },
  currentIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -6 }],
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
  },
});