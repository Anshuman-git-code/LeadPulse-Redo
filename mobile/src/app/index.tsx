import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_BASE_URL, socket } from '../services/socket';

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

    async function loadHistory() {
      try {
        const response = await fetch(`${API_BASE_URL}/leads?limit=50`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        setLeads(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.warn('Could not load lead history:', error);
      }
    }

    loadHistory();

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
        <Text style={styles.detail}>Email: {item.email || 'Not provided'}</Text>
        <Text style={styles.detail}>Phone: {item.phone || 'Not provided'}</Text>
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
        {connectionStatus === 'Connecting…' ? <ActivityIndicator /> : null}
      </View>

      <Text style={styles.sectionTitle}>Incoming leads ({leads.length})</Text>
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
    backgroundColor: '#f4f6f8',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#17202a',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectedDot: {
    backgroundColor: '#16803c',
  },
  disconnectedDot: {
    backgroundColor: '#bd3333',
  },
  statusText: {
    color: '#344054',
    flex: 1,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#17202a',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e5eb',
  },
  leadName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#17202a',
    marginBottom: 6,
  },
  detail: {
    color: '#344054',
    fontSize: 14,
    marginBottom: 3,
  },
  timestamp: {
    color: '#667085',
    fontSize: 11,
    marginTop: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#667085',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 12,
  },
});