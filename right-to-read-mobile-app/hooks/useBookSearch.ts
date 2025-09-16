import { BookSearchService } from '@/services/bookSearchService';
import { Book } from '@/types/book';
import { useCallback, useState } from 'react';

interface UseBookSearchReturn {
  searchQuery: string;
  filteredBooks: Book[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: () => void;
  clearSearch: () => void;
  searchSuggestions: string[];
}

export function useBookSearch(allBooks: Book[]): UseBookSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(allBooks);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const performSearch = useCallback(() => {
    setIsSearching(true);
    
    try {
      const results = BookSearchService.searchBooksByName(allBooks, searchQuery);
      setFilteredBooks(results);
      
      // Update suggestions based on current query
      const suggestions = BookSearchService.getSearchSuggestions(allBooks, searchQuery);
      setSearchSuggestions(suggestions);
      
      console.log(`Search completed: "${searchQuery}" found ${results.length} results`);
    } catch (error) {
      console.error('Search error:', error);
      setFilteredBooks(allBooks);
    } finally {
      setIsSearching(false);
    }
  }, [allBooks, searchQuery]);

  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // If query is empty, show all books immediately
    if (!query || query.trim() === '') {
      setFilteredBooks(allBooks);
      setSearchSuggestions([]);
      setIsSearching(false);
    } else {
      // Perform real-time search as user types
      setIsSearching(true);
      const results = BookSearchService.searchBooksByName(allBooks, query);
      setFilteredBooks(results);
      
      // Update suggestions as user types
      const suggestions = BookSearchService.getSearchSuggestions(allBooks, query);
      setSearchSuggestions(suggestions);
      
      setIsSearching(false);
      console.log(`Real-time search: "${query}" found ${results.length} results`);
    }
  }, [allBooks]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredBooks(allBooks);
    setSearchSuggestions([]);
    setIsSearching(false);
  }, [allBooks]);

  return {
    searchQuery,
    filteredBooks,
    isSearching,
    setSearchQuery: handleSearchQueryChange,
    performSearch,
    clearSearch,
    searchSuggestions,
  };
}
