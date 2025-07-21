import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, IconButton } from 'react-native-paper';

interface CustomerSearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  loading?: boolean;
  searchRef?: React.RefObject<any>;
}

export function CustomerSearchInput({
  searchQuery,
  onSearchChange,
  onFocus,
  onBlur,
  onClear,
  loading = false,
  searchRef,
}: CustomerSearchInputProps) {
  return (
    <View style={styles.searchContainer}>
      <Searchbar
        ref={searchRef}
        placeholder="Search customers by name or phone..."
        value={searchQuery}
        onChangeText={onSearchChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={styles.searchbar}
        icon="account-search"
        loading={loading}
        accessible={true}
        accessibilityLabel="Search customers by name or phone number"
        accessibilityHint="Type to search for existing customers or create new one"
      />
      {searchQuery.length > 0 && (
        <IconButton
          icon="close"
          size={20}
          style={styles.clearButton}
          onPress={onClear}
          accessible={true}
          accessibilityLabel="Clear search"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'relative',
  },
  searchbar: {
    marginBottom: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'transparent',
  },
});
