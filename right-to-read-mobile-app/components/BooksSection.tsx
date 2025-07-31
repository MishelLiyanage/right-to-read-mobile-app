import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import BookCard from '@/components/BookCard';

const books = [
  {
    id: 1,
    title: 'Grade 3 English Book',
    backgroundColor: '#4A90E2',
  },
  {
    id: 2,
    title: 'The Adventures of Little Star',
    backgroundColor: '#7ED321',
  },
  {
    id: 3,
    title: 'Rainbow Friends',
    backgroundColor: '#F5A623',
  },
  {
    id: 4,
    title: 'The Brave Little Mouse',
    backgroundColor: '#D0021B',
  },
];

export default function BooksSection() {
  const handleBookPress = (book: any) => {
    console.log('Book pressed:', book.title);
    // Handle book navigation
  };

  return (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            title={book.title}
            backgroundColor={book.backgroundColor}
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
