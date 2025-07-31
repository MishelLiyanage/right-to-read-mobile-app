import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function RecentScreen() {
  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>Recent Books</ThemedText>
          <ThemedText style={styles.emptyMessage}>
            No recent books yet. Start reading to see your recent books here!
          </ThemedText>
        </View>
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
  section: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});
