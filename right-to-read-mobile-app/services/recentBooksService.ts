import { Book } from '@/types/book';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_BOOKS_KEY = '@recent_books';
const MAX_RECENT_BOOKS = 10; // Maximum number of recent books to store

export class RecentBooksService {
  /**
   * Add a book to the recent books list
   * @param book - The book to add to recent books
   */
  static async addRecentBook(book: Book): Promise<void> {
    try {
      const recentBooks = await this.getRecentBooks();
      
      // Remove the book if it already exists (to avoid duplicates and move it to top)
      const filteredBooks = recentBooks.filter(recentBook => recentBook.id !== book.id);
      
      // Add the book to the beginning of the array
      const updatedRecentBooks = [book, ...filteredBooks];
      
      // Keep only the maximum number of recent books
      const limitedRecentBooks = updatedRecentBooks.slice(0, MAX_RECENT_BOOKS);
      
      // Save to storage
      await AsyncStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(limitedRecentBooks));
      
      console.log(`Added "${book.title}" to recent books`);
    } catch (error) {
      console.error('Error adding book to recent books:', error);
    }
  }

  /**
   * Get the list of recent books
   * @returns Array of recent books
   */
  static async getRecentBooks(): Promise<Book[]> {
    try {
      const recentBooksJson = await AsyncStorage.getItem(RECENT_BOOKS_KEY);
      
      if (recentBooksJson) {
        const recentBooks: Book[] = JSON.parse(recentBooksJson);
        return recentBooks;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting recent books:', error);
      return [];
    }
  }

  /**
   * Remove a book from recent books
   * @param bookId - The ID of the book to remove
   */
  static async removeRecentBook(bookId: number): Promise<void> {
    try {
      const recentBooks = await this.getRecentBooks();
      const filteredBooks = recentBooks.filter(book => book.id !== bookId);
      
      await AsyncStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(filteredBooks));
      
      console.log(`Removed book with ID ${bookId} from recent books`);
    } catch (error) {
      console.error('Error removing book from recent books:', error);
    }
  }

  /**
   * Clear all recent books
   */
  static async clearRecentBooks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENT_BOOKS_KEY);
      console.log('Cleared all recent books');
    } catch (error) {
      console.error('Error clearing recent books:', error);
    }
  }

  /**
   * Check if a book is in recent books
   * @param bookId - The ID of the book to check
   * @returns True if the book is in recent books, false otherwise
   */
  static async isBookRecent(bookId: number): Promise<boolean> {
    try {
      const recentBooks = await this.getRecentBooks();
      return recentBooks.some(book => book.id === bookId);
    } catch (error) {
      console.error('Error checking if book is recent:', error);
      return false;
    }
  }
}
