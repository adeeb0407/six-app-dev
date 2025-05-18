import { categoryTabColors, CategoryTabs } from '@/src/constants/types/categoryTabs';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    tabs: CategoryTabs[];
    selectedTabs: CategoryTabs[];
    onToggle: (tab: CategoryTabs) => void;
};


const CategoryTabSelector = ({ tabs, selectedTabs, onToggle }: Props) => {
    return (
        <View style={styles.categoryTabContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            >
                {tabs.map((tab, index) => {
                    const isSelected = selectedTabs.includes(tab);
                    const { bg } = categoryTabColors[tab];

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => onToggle(tab)}
                            style={[
                                styles.categoryTab,
                                {
                                    backgroundColor: bg,
                                    borderColor: isSelected ? '#007bff' : 'transparent',
                                    borderWidth: isSelected ? 2 : 0,
                                },
                            ]}
                        >
                            <Text style={styles.categoryTabText}>{tab}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    categoryTabContainer: {
        paddingVertical: 10
    },
    categoryTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        margin: 4,
    },
    categoryTabSelected: {
        backgroundColor: '#5170ff',
    },
    categoryTabText: {
        color: '#333',
        fontWeight: '500'
    },
    categoryTabTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
})

export default CategoryTabSelector