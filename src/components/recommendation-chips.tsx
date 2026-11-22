
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import type { Listing } from "@/lib/feed";
import type { Preferences } from "@/lib/personalize";
import { reasons } from "@/lib/reasons";

interface RecommendationChipsProps {
    listing: Listing;
    prefs?: Preferences;
}

export function RecommendationChips({
    listing,
    prefs,
}: RecommendationChipsProps) {
    const matchReasons = reasons(listing, prefs);

    if (matchReasons.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            {matchReasons.map((reason) => (
                <View key={reason} style={styles.chip}>
                    <ThemedText style={styles.chipText}>
                        {reason}
                    </ThemedText>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
        marginBottom: 8,
    },
    chip: {
        backgroundColor: "#DCFCE7",
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    chipText: {
        color: "#166534",
        fontSize: 12,
        fontWeight: "500",
    },
});
