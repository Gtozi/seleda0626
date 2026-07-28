/**
 * Rooms Screen
 * View and manage room inventory and status
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const RoomsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rooms</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>120</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>45</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Occupied</Text>
          <Text style={styles.statValue}>68</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Maintenance</Text>
          <Text style={styles.statValue}>7</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room Types</Text>
        <View style={styles.roomTypeCard}>
          <Text style={styles.roomTypeName}>Standard Room</Text>
          <View style={styles.roomTypeStats}>
            <Text style={styles.roomTypeStat}>40 total</Text>
            <Text style={styles.roomTypeStat}>15 available</Text>
          </View>
        </View>
        <View style={styles.roomTypeCard}>
          <Text style={styles.roomTypeName}>Deluxe Suite</Text>
          <View style={styles.roomTypeStats}>
            <Text style={styles.roomTypeStat}>30 total</Text>
            <Text style={styles.roomTypeStat}>8 available</Text>
          </View>
        </View>
        <View style={styles.roomTypeCard}>
          <Text style={styles.roomTypeName}>Ocean View</Text>
          <View style={styles.roomTypeStats}>
            <Text style={styles.roomTypeStat}>25 total</Text>
            <Text style={styles.roomTypeStat}>12 available</Text>
          </View>
        </View>
        <View style={styles.roomTypeCard}>
          <Text style={styles.roomTypeName}>Family Suite</Text>
          <View style={styles.roomTypeStats}>
            <Text style={styles.roomTypeStat}>25 total</Text>
            <Text style={styles.roomTypeStat}>10 available</Text>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
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
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  roomTypeCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  roomTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roomTypeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomTypeStat: {
    fontSize: 14,
    color: '#666',
  },
});

export default RoomsScreen;
