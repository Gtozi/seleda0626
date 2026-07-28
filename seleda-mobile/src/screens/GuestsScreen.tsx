/**
 * Guests Screen
 * View and manage guest information
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const GuestsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guests</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchPlaceholder}>Search guests...</Text>
      </View>

      <View style={styles.guestList}>
        <View style={styles.guestCard}>
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>John Doe</Text>
            <Text style={styles.guestEmail}>john.doe@email.com</Text>
            <Text style={styles.guestPhone}>+251 911 123 456</Text>
          </View>
          <View style={styles.guestStats}>
            <Text style={styles.statLabel}>Stays: 5</Text>
            <Text style={styles.statLabel}>Nights: 23</Text>
          </View>
        </View>

        <View style={styles.guestCard}>
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>Sarah Smith</Text>
            <Text style={styles.guestEmail}>sarah.smith@email.com</Text>
            <Text style={styles.guestPhone}>+251 911 234 567</Text>
          </View>
          <View style={styles.guestStats}>
            <Text style={styles.statLabel}>Stays: 12</Text>
            <Text style={styles.statLabel}>Nights: 48</Text>
          </View>
        </View>

        <View style={styles.guestCard}>
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>Mike Johnson</Text>
            <Text style={styles.guestEmail}>mike.j@email.com</Text>
            <Text style={styles.guestPhone}>+251 911 345 678</Text>
          </View>
          <View style={styles.guestStats}>
            <Text style={styles.statLabel}>Stays: 3</Text>
            <Text style={styles.statLabel}>Nights: 8</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 14,
  },
  guestList: {
    padding: 15,
  },
  guestCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestInfo: {
    marginBottom: 10,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  guestEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  guestPhone: {
    fontSize: 14,
    color: '#666',
  },
  guestStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    gap: 20,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
});

export default GuestsScreen;
