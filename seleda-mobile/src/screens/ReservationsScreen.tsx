/**
 * Reservations Screen
 * View and manage hotel reservations
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const ReservationsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservations</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Check-in Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Check-out Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reservationList}>
        <View style={styles.reservationCard}>
          <View style={styles.reservationHeader}>
            <Text style={styles.guestName}>John Doe</Text>
            <Text style={[styles.status, styles.statusConfirmed]}>Confirmed</Text>
          </View>
          <Text style={styles.roomType}>Deluxe Suite</Text>
          <Text style={styles.dates}>Jul 20 - Jul 25, 2026</Text>
          <Text style={styles.guests}>2 Adults, 0 Children</Text>
        </View>

        <View style={styles.reservationCard}>
          <View style={styles.reservationHeader}>
            <Text style={styles.guestName}>Sarah Smith</Text>
            <Text style={[styles.status, styles.statusCheckedIn]}>Checked In</Text>
          </View>
          <Text style={styles.roomType}>Standard Room</Text>
          <Text style={styles.dates}>Jul 18 - Jul 22, 2026</Text>
          <Text style={styles.guests}>1 Adult, 0 Children</Text>
        </View>

        <View style={styles.reservationCard}>
          <View style={styles.reservationHeader}>
            <Text style={styles.guestName}>Mike Johnson</Text>
            <Text style={[styles.status, styles.statusPending]}>Pending</Text>
          </View>
          <Text style={styles.roomType}>Ocean View</Text>
          <Text style={styles.dates}>Jul 22 - Jul 28, 2026</Text>
          <Text style={styles.guests}>2 Adults, 1 Child</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
    fontSize: 12,
  },
  reservationList: {
    padding: 15,
  },
  reservationCard: {
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
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusConfirmed: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusCheckedIn: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  roomType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dates: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  guests: {
    fontSize: 13,
    color: '#999',
  },
});

export default ReservationsScreen;
