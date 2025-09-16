import Banner from '@/components/Banner';
import BookReader from '@/components/BookReader';
import BooksSection from '@/components/BooksSection';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAllBooks } from '@/data/books';
import { useBookSearch } from '@/hooks/useBookSearch';
import { useRecentBooks } from '@/hooks/useRecentBooks';
import { Book } from '@/types/book';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BooksScreen() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const allBooks = getAllBooks();
  
  const {
    searchQuery,
    filteredBooks,
    isSearching,
    setSearchQuery,
    performSearch,
    clearSearch,
  } = useBookSearch(allBooks);

  const { recentBooks, isLoading, refreshRecentBooks, clearRecentBooks, addRecentBook } = useRecentBooks();

  const handleBookPress = async (book: Book) => {
    // Add book to recent books when clicked
    try {
      await addRecentBook(book);
      console.log(`Added "${book.title}" to recent books`);
    } catch (error) {
      console.error('Failed to add book to recent:', error);
    }
    
    setSelectedBook(book);
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  const handleSearchPress = () => {
    performSearch();
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

  const isSearchMode = searchQuery.trim() !== '';
  const displayBooks = activeTab === 'all' ? filteredBooks : recentBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshRecentBooks}
          />
        }
      >
        <Banner />
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Books
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
              Recent Books
            </ThemedText>
          </TouchableOpacity>
        </View>

        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchPress={handleSearchPress}
          placeholder="Search books by name or author..."
        />

        {/* Clear Recent Books Button (only show for recent tab) */}
        {activeTab === 'recent' && recentBooks.length > 0 && (
          <View style={styles.clearButtonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearRecent}>
              <ThemedText style={styles.clearButtonText}>Clear Recent Books</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <BooksSection 
          books={displayBooks}
          onBookPress={handleBookPress}
          isSearchMode={isSearchMode}
          searchQuery={searchQuery}
        />

        {/* Empty state message */}
        {displayBooks.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <ThemedText style={styles.emptyStateText}>
              {activeTab === 'recent' 
                ? "No recent books yet. Start reading to see them here!" 
                : isSearchMode 
                  ? "No books found matching your search."
                  : "No books available."
              }
            </ThemedText>
          </View>
        )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  clearButtonContainer: {
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 6,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
