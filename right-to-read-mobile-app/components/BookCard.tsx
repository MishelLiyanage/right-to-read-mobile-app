import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface BookCardProps {
  title: string;
  backgroundColor: string;
  hasData?: boolean;
  onPress?: () => void;
}

export default function BookCard({ title, backgroundColor, hasData, onPress }: BookCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        {hasData && (
          <View style={styles.availableBadge}>
            <ThemedText style={styles.badgeText}>Available</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 220,
    borderRadius: 12,
    marginRight: 15,
    justifyContent: 'flex-end',
    padding: 15,
  },
  cardContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  availableBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
