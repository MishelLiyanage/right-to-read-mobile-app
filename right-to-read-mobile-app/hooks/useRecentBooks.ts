import { RecentBooksService } from '@/services/recentBooksService';
import { Book } from '@/types/book';
import { useCallback, useEffect, useState } from 'react';

interface UseRecentBooksReturn {
  recentBooks: Book[];
  addRecentBook: (book: Book) => Promise<void>;
  removeRecentBook: (bookId: number) => Promise<void>;
  clearRecentBooks: () => Promise<void>;
  isBookRecent: (bookId: number) => Promise<boolean>;
  isLoading: boolean;
  refreshRecentBooks: () => Promise<void>;
}

export function useRecentBooks(): UseRecentBooksReturn {
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load recent books on mount
  const loadRecentBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const books = await RecentBooksService.getRecentBooks();
      setRecentBooks(books);
    } catch (error) {
      console.error('Error loading recent books:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a book to recent books
  const addRecentBook = useCallback(async (book: Book) => {
    try {
      await RecentBooksService.addRecentBook(book);
      // Refresh the recent books list
      await loadRecentBooks();
    } catch (error) {
      console.error('Error adding recent book:', error);
    }
  }, [loadRecentBooks]);

  // Remove a book from recent books
  const removeRecentBook = useCallback(async (bookId: number) => {
    try {
      await RecentBooksService.removeRecentBook(bookId);
      // Update local state immediately for better UX
      setRecentBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } catch (error) {
      console.error('Error removing recent book:', error);
    }
  }, []);

  // Clear all recent books
  const clearRecentBooks = useCallback(async () => {
    try {
      await RecentBooksService.clearRecentBooks();
      setRecentBooks([]);
    } catch (error) {
      console.error('Error clearing recent books:', error);
    }
  }, []);

  // Check if a book is in recent books
  const isBookRecent = useCallback(async (bookId: number): Promise<boolean> => {
    try {
      return await RecentBooksService.isBookRecent(bookId);
    } catch (error) {
      console.error('Error checking if book is recent:', error);
      return false;
    }
  }, []);

  // Refresh recent books (useful for pull-to-refresh)
  const refreshRecentBooks = useCallback(async () => {
    await loadRecentBooks();
  }, [loadRecentBooks]);

  // Load recent books on component mount
  useEffect(() => {
    loadRecentBooks();
  }, [loadRecentBooks]);

  return {
    recentBooks,
    addRecentBook,
    removeRecentBook,
    clearRecentBooks,
    isBookRecent,
    isLoading,
    refreshRecentBooks,
  };
}
