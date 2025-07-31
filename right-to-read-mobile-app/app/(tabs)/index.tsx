import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from '@/components/Header';
import Banner from '@/components/Banner';
import BooksSection from '@/components/BooksSection';
import { ThemedView } from '@/components/ThemedView';

export default function BooksScreen() {
  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <Banner />
        <BooksSection />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});
