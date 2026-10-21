import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { socket } from '../services/socket';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export default function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting…');

  useEffect(() => {
    function onConnect() {
      setConnectionStatus('Connected to backend');
    }

    function onDisconnect() {
      setConnectionStatus('Disconnected — reconnecting…');
    }

    function onConnectError(error: Error) {
      setConnectionStatus(`Connection error: ${error.message}`);
    }

    function onNewLead(incomingLead: Lead) {
      setLeads((previousLeads) => [
        incomingLead,
        ...previousLeads.filter((lead) => lead.id !== incomingLead.id),
      ]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('new-lead', onNewLead);
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('new-lead', onNewLead);
      socket.disconnect();
    };
  }, []);

  function renderLead({ item }: { item: Lead }) {
    return (
      <View style={styles.card}>
        <Text style={styles.leadName}>{item.name || 'Unknown'}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{item.email || 'Not provided'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{item.phone || 'Not provided'}</Text>
        </View>
        <Text style={styles.timestamp}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>MetaLeadPulse</Text>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            connectionStatus === 'Connected to backend'
              ? styles.connectedDot
              : styles.disconnectedDot,
          ]}
        />
        <Text style={styles.statusText}>{connectionStatus}</Text>
        {connectionStatus === 'Connecting…' ? <ActivityIndicator color="#58a6ff" /> : null}
      </View>

      <Text style={styles.sectionTitle}>INCOMING LEADS · {leads.length}</Text>
      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        renderItem={renderLead}
        contentContainerStyle={leads.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No leads yet. Send a test lead to see it appear here automatically.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#161b22',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  connectedDot: {
    backgroundColor: '#3fb950',
  },
  disconnectedDot: {
    backgroundColor: '#f85149',
  },
  statusText: {
    color: '#adbac7',
    flex: 1,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#768390',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#161b22',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
    borderLeftWidth: 3,
    borderLeftColor: '#1f6feb',
  },
  leadName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
  },
  detailLabel: {
    color: '#58a6ff',
    fontSize: 13,
    fontWeight: '600',
    width: 44,
  },
  detailValue: {
    color: '#adbac7',
    fontSize: 13,
    flex: 1,
  },
  timestamp: {
    color: '#768390',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'right',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#768390',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
    fontSize: 14,
  },
});