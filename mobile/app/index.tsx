import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function Index() {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Klynaa Mobile</Text>
            <Stack.Screen options={{ title: 'Klynaa' }} />
        </View>
    );
}
