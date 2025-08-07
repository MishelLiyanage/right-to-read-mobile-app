import BookCard from '@/components/BookCard';
import { getAllBooks } from '@/data/books';
import { Book } from '@/types/book';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface BooksSectionProps {
  onBookPress: (book: Book) => void;
}

export default function BooksSection({ onBookPress }: BooksSectionProps) {
  const books = getAllBooks();

  const handleBookPress = (book: Book) => {
    console.log('Book pressed:', book.title);
    if (book.hasData) {
      onBookPress(book);
    } else {
      console.log('Book content not available yet');
    }
  };

  return (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {books.map((book) => (
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
});
