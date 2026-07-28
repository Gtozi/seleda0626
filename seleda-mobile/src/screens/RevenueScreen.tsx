/**
 * Revenue Screen
 * View revenue metrics and pricing recommendations
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const RevenueScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Revenue Management</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today's Revenue</Text>
          <Text style={styles.statValue}>$8,450</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>MTD Revenue</Text>
          <Text style={styles.statValue}>$124,500</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ADR</Text>
          <Text style={styles.statValue}>$142</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>RevPAR</Text>
          <Text style={styles.statValue}>$111</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing Recommendations</Text>
        <View style={styles.recommendationCard}>
          <View style={styles.recHeader}>
            <Text style={styles.recRoom}>Deluxe Suite</Text>
            <Text style={[styles.recAction, styles.recIncrease]}>+10%</Text>
          </View>
          <Text style={styles.recReason}>High demand forecast for weekend</Text>
          <Text style={styles.recConfidence}>Confidence: 92%</Text>
        </View>
        <View style={styles.recommendationCard}>
          <View style={styles.recHeader}>
            <Text style={styles.recRoom}>Standard Room</Text>
            <Text style={[styles.recAction, styles.recIncrease]}>+5%</Text>
          </View>
          <Text style={styles.recReason}>Competitor rate increase detected</Text>
          <Text style={styles.recConfidence}>Confidence: 85%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Competitor Rates</Text>
        <View style={styles.competitorCard}>
          <Text style={styles.competitorName}>Booking.com</Text>
          <Text style={styles.competitorRate}>Avg: $155</Text>
        </View>
        <View style={styles.competitorCard}>
          <Text style={styles.competitorName}>Expedia</Text>
          <Text style={styles.competitorRate}>Avg: $148</Text>
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
  recommendationCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recRoom: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  recIncrease: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  recReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recConfidence: {
    fontSize: 12,
    color: '#999',
  },
  competitorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  competitorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  competitorRate: {
    fontSize: 14,
    color: '#666',
  },
});

export default RevenueScreen;
