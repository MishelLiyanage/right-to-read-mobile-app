import Banner from '@/components/Banner';
import BookReader from '@/components/BookReader';
import BooksSection from '@/components/BooksSection';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import { ThemedView } from '@/components/ThemedView';
import { getAllBooks } from '@/data/books';
import { useBookSearch } from '@/hooks/useBookSearch';
import { useRecentBooks } from '@/hooks/useRecentBooks';
import { Book } from '@/types/book';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function BooksScreen() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const allBooks = getAllBooks();
  
  const {
    searchQuery,
    filteredBooks,
    isSearching,
    setSearchQuery,
    performSearch,
    clearSearch,
  } = useBookSearch(allBooks);

  const { addRecentBook } = useRecentBooks();

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

  if (selectedBook) {
    return <BookReader book={selectedBook} onClose={handleCloseReader} />;
  }

  const isSearchMode = searchQuery.trim() !== '';

  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <Banner />
        <SearchBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchPress={handleSearchPress}
          placeholder="Search books by name or author..."
        />
        <BooksSection 
          books={filteredBooks}
          onBookPress={handleBookPress}
          isSearchMode={isSearchMode}
          searchQuery={searchQuery}
        />
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
