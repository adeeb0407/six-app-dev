import NextButton from '@/src/components/common/NextButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Guide1 = () => {  // Capitalized component name for consistency
    const router = useRouter();

    const handleNext = () => {
        router.push('/guide2');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    You’re in
                    So here’s how this works.
                </Text>
            </View>

            <NextButton
                onPress={handleNext}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    content: {
        marginTop: 60,
        marginBottom: 30

    },
    title: {
        fontSize: 28,
        fontWeight: '500',
        color: '#000',
        marginBottom: 32,
        textAlign: 'center',
        lineHeight: 34,
    },
    degreesContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    degreeItem: {
        fontSize: 18,
        color: '#666',
        marginBottom: 16,
        lineHeight: 24,
    },
    degreeHighlight: {
        color: '#9191ff',
        fontWeight: '600',
    }
});

export default Guide1;