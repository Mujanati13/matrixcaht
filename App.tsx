/**
 * MatrixChat iOS App
 * Secure end-to-end encrypted messaging
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  StyleSheet,
} from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1e1e1e"
      />
      <View style={styles.content}>
        <Text style={styles.title}>MatrixChat</Text>
        <Text style={styles.subtitle}>Secure Matrix Protocol Messaging</Text>
        <Text style={styles.debug}>App is running! 🎉</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 20,
  },
  debug: {
    fontSize: 18,
    color: '#00FF00',
    fontWeight: 'bold',
  },
});

export default App;
