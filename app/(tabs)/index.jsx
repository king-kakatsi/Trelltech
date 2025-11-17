import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Subreddits</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>r/reactnative</Text>
        <Text style={styles.cardDesc}>React Native Community</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>r/expo</Text>
        <Text style={styles.cardDesc}>Expo Framework</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>r/programming</Text>
        <Text style={styles.cardDesc}>Programming Discussions</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>r/javascript</Text>
        <Text style={styles.cardDesc}>JavaScript Developers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1b',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
  },
});