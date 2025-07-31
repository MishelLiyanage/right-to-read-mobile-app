import Banner from '@/components/Banner';
import BookReader from '@/components/BookReader';
import BooksSection from '@/components/BooksSection';
import Header from '@/components/Header';
import { ThemedView } from '@/components/ThemedView';
import { Book } from '@/types/book';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function BooksScreen() {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookPress = (book: Book) => {
    setSelectedBook(book);
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  if (selectedBook) {
    return <BookReader book={selectedBook} onClose={handleCloseReader} />;
  }

  return (
    <ThemedView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <Banner />
        <BooksSection onBookPress={handleBookPress} />
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
