/**
 * Channel Manager Screen
 * View and manage OTA channel connections and sync status
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ChannelManagerScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Channel Manager</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Channels</Text>
          <Text style={styles.statValue}>4</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sync Success</Text>
          <Text style={styles.statValue}>95%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Last Sync</Text>
          <Text style={styles.statValue}>2m ago</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Channel Connections</Text>
        <View style={styles.channelCard}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>Booking.com</Text>
            <Text style={[styles.status, styles.statusActive]}>Active</Text>
          </View>
          <Text style={styles.channelInfo}>Last sync: 2 min ago</Text>
          <Text style={styles.channelInfo}>Inventory: 45 rooms</Text>
          <Text style={styles.channelInfo}>Rate parity: Enabled</Text>
        </View>

        <View style={styles.channelCard}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>Expedia</Text>
            <Text style={[styles.status, styles.statusActive]}>Active</Text>
          </View>
          <Text style={styles.channelInfo}>Last sync: 30 min ago</Text>
          <Text style={styles.channelInfo}>Inventory: 38 rooms</Text>
          <Text style={styles.channelInfo}>Rate parity: Enabled</Text>
        </View>

        <View style={styles.channelCard}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>Airbnb</Text>
            <Text style={[styles.status, styles.statusWarning]}>Warning</Text>
          </View>
          <Text style={styles.channelInfo}>Last sync: Failed</Text>
          <Text style={[styles.channelInfo, styles.errorText]}>Error: API rate limit</Text>
          <Text style={styles.channelInfo}>Inventory: 25 rooms</Text>
        </View>

        <View style={styles.channelCard}>
          <View style={styles.channelHeader}>
            <Text style={styles.channelName}>Amadeus</Text>
            <Text style={[styles.status, styles.statusTest]}>Test Mode</Text>
          </View>
          <Text style={styles.channelInfo}>Last sync: 1 hour ago</Text>
          <Text style={styles.channelInfo}>Inventory: 0 rooms</Text>
          <Text style={styles.channelInfo}>Rate parity: Enabled</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sync Activity</Text>
        <View style={styles.syncItem}>
          <Text style={styles.syncText}>Booking.com - Inventory sync</Text>
          <Text style={[styles.syncStatus, styles.syncSuccess]}>Success</Text>
        </View>
        <View style={styles.syncItem}>
          <Text style={styles.syncText}>Expedia - Rate sync</Text>
          <Text style={[styles.syncStatus, styles.syncSuccess]}>Success</Text>
        </View>
        <View style={styles.syncItem}>
          <Text style={styles.syncText}>Airbnb - Inventory sync</Text>
          <Text style={[styles.syncStatus, styles.syncFailed]}>Failed</Text>
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
  channelCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelName: {
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
  statusActive: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusWarning: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusTest: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  channelInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  errorText: {
    color: '#dc3545',
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
  },
  syncText: {
    fontSize: 14,
    color: '#333',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncSuccess: {
    color: '#28a745',
  },
  syncFailed: {
    color: '#dc3545',
  },
});

export default ChannelManagerScreen;
