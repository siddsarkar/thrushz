import { Button, Text, View } from 'react-native';

export function MiniPlayer({ onPress }: { onPress: () => void }) {
  return (
    <View>
      <Text>MiniPlayer</Text>
      <Button title="Open" onPress={onPress} />
    </View>
  );
}
