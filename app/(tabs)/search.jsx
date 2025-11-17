import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search subreddits..."
        placeholderTextColor="#818384"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <ScrollView>
        <Text style={styles.title}>Popular Subreddits</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>r/askreddit</Text>
          <Text style={styles.cardDesc}>Ask and answer questions</Text>
          <Text style={styles.subscribe}>+ Subscribe</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>r/funny</Text>
          <Text style={styles.cardDesc}>Funny posts and memes</Text>
          <Text style={styles.subscribe}>+ Subscribe</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>r/gaming</Text>
          <Text style={styles.cardDesc}>Gaming community</Text>
          <Text style={styles.subscribe}>+ Subscribe</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1b',
    padding: 15,
  },
  searchBar: {
    backgroundColor: '#272729',
    padding: 15,
    borderRadius: 10,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#343536',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#272729',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#343536',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  cardDesc: {
    fontSize: 14,
    color: '#818384',
    marginTop: 5,
    marginBottom: 10,
  },
  subscribe: {
    fontSize: 14,
    color: '#FF4500',
    fontWeight: 'bold',
  },
});