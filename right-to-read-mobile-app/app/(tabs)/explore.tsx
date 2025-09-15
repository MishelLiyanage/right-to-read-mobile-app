import Banner from '@/components/Banner';
import BookReader from '@/components/BookReader';
import BooksSection from '@/components/BooksSection';
import Header from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRecentBooks } from '@/hooks/useRecentBooks';
import { Book } from '@/types/book';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RecentScreen() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { recentBooks, isLoading, refreshRecentBooks, clearRecentBooks, addRecentBook } = useRecentBooks();

  const handleBookPress = async (book: Book) => {
    // Add book to recent books when clicked (moves it to top)
    try {
      await addRecentBook(book);
      console.log(`Updated recent position for "${book.title}"`);
    } catch (error) {
      console.error('Failed to update book in recent:', error);
    }
    
    setSelectedBook(book);
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  const handleClearRecent = async () => {
    try {
      await clearRecentBooks();
      console.log('Cleared all recent books');
    } catch (error) {
      console.error('Failed to clear recent books:', error);
    }
  };

  if (selectedBook) {
    return <BookReader book={selectedBook} onClose={handleCloseReader} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshRecentBooks}
            title="Pull to refresh recent books"
          />
        }
      >
        <Banner />
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <ThemedText type="title" style={styles.sectionTitle}>Recent Books</ThemedText>
            {recentBooks.length > 0 && (
              <TouchableOpacity onPress={handleClearRecent} style={styles.clearButton}>
                <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {recentBooks.length === 0 ? (
            <ThemedText style={styles.emptyMessage}>
              No recent books yet. Start reading to see your recent books here!
            </ThemedText>
          ) : (
            <BooksSection 
              books={recentBooks}
              onBookPress={handleBookPress}
              isSearchMode={false}
            />
          )}
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});
