import BookCard from '@/components/BookCard';
import { ThemedText } from '@/components/ThemedText';
import { Book } from '@/types/book';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface BooksSectionProps {
  books: Book[];
  onBookPress: (book: Book) => void;
  isSearchMode?: boolean;
  searchQuery?: string;
}

export default function BooksSection({ books, onBookPress, isSearchMode = false, searchQuery = '' }: BooksSectionProps) {
  const handleBookPress = (book: Book) => {
    console.log('Book pressed:', book.title);
    if (book.hasData) {
      onBookPress(book);
    } else {
      console.log('Book content not available yet');
    }
  };

  // Show message when no books found in search
  if (isSearchMode && books.length === 0 && searchQuery.trim() !== '') {
    return (
      <View style={styles.section}>
        <View style={styles.noResultsContainer}>
          <ThemedText style={styles.noResultsText}>
            No books found for "{searchQuery}"
          </ThemedText>
          <ThemedText style={styles.noResultsSubtext}>
            Try searching with different keywords
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {isSearchMode && books.length > 0 && searchQuery.trim() !== '' && (
        <View style={styles.searchResultsHeader}>
          <ThemedText style={styles.searchResultsText}>
            Found {books.length} book{books.length !== 1 ? 's' : ''} for "{searchQuery}"
          </ThemedText>
        </View>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {books.map((book: Book) => (
          <BookCard
            key={book.id}
            title={book.title}
            backgroundColor={book.backgroundColor}
            hasData={book.hasData}
            onPress={() => handleBookPress(book)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  noResultsContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  searchResultsHeader: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
