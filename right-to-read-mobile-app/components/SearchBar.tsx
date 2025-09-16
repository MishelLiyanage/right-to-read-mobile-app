import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchPress: () => void;
  placeholder?: string;
}

export default function SearchBar({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearchPress, 
  placeholder = "Search books by name..." 
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          onSubmitEditing={onSearchPress}
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <ThemedText style={styles.searchButtonText}>🔍</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  searchButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});
