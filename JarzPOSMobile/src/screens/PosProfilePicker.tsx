import React from 'react';
import { StyleSheet } from 'react-native';
import { List, ActivityIndicator, Text } from 'react-native-paper';
import { ScreenContainer } from '../components';
import { useGetPosProfilesQuery } from '../api/posApi';
import { usePos } from '../auth/PosContext';

export function PosProfilePickerScreen(): React.ReactElement {
  const { data: profiles, isLoading } = useGetPosProfilesQuery();
  const { setProfile } = usePos();

  if (isLoading) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator animating />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Select a POS Profile</Text>
      {profiles?.map((p, idx) => {
        // `p` can be string or object (after mapping in transformResponse)
        const name = typeof p === 'string' ? p : p.name;
        return (
          <List.Item
            key={name}
            title={name}
            onPress={() => setProfile(name)}
            left={(props) => <List.Icon {...props} icon="store" />}
          />
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 16 },
});
