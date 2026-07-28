/**
 * Dashboard Screen
 * Main dashboard showing key metrics and recent activity
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SELEDA Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Occupancy</Text>
          <Text style={styles.statValue}>78%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ADR</Text>
          <Text style={styles.statValue}$142</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>RevPAR</Text>
          <Text style={styles.statValue}$111</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Check-ins</Text>
          <Text style={styles.statValue}>24</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>New reservation: John Doe - Deluxe Suite</Text>
          <Text style={styles.activityTime}>2 min ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Check-in: Sarah Smith - Standard Room</Text>
          <Text style={styles.activityTime}>15 min ago</Text>
        </View>
        <View style={styles.activityItem}>
          <Text style={styles.activityText}>Channel sync: Booking.com completed</Text>
          <Text style={styles.activityTime}>30 min ago</Text>
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  activityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default DashboardScreen;
