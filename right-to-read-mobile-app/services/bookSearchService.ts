import { Book } from '@/types/book';

export class BookSearchService {
  /**
   * Search books by name (title)
   * @param books - Array of books to search through
   * @param query - Search query string
   * @returns Filtered array of books matching the query
   */
  static searchBooksByName(books: Book[], query: string): Book[] {
    if (!query || query.trim() === '') {
      return books;
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    return books.filter(book => 
      book.title.toLowerCase().includes(normalizedQuery) ||
      book.author.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Advanced search with multiple criteria
   * @param books - Array of books to search through
   * @param query - Search query string
   * @param searchInAuthor - Whether to include author in search (default: true)
   * @returns Filtered array of books matching the criteria
   */
  static advancedSearch(books: Book[], query: string, searchInAuthor: boolean = true): Book[] {
    if (!query || query.trim() === '') {
      return books;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    
    return books.filter(book => {
      const titleMatch = searchTerms.some(term => 
        book.title.toLowerCase().includes(term)
      );
      
      const authorMatch = searchInAuthor && searchTerms.some(term => 
        book.author.toLowerCase().includes(term)
      );
      
      return titleMatch || authorMatch;
    });
  }

  /**
   * Get search suggestions based on partial query
   * @param books - Array of books to get suggestions from
   * @param query - Partial search query
   * @param maxSuggestions - Maximum number of suggestions to return (default: 5)
   * @returns Array of suggestion strings
   */
  static getSearchSuggestions(books: Book[], query: string, maxSuggestions: number = 5): string[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions = new Set<string>();
    
    books.forEach(book => {
      // Add title suggestions
      if (book.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(book.title);
      }
      
      // Add author suggestions
      if (book.author.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(book.author);
      }
    });
    
    return Array.from(suggestions).slice(0, maxSuggestions);
  }
}
