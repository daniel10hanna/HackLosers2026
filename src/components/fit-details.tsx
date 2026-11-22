
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Listing } from "@/lib/feed";
import { getFitDetails } from "@/lib/fit-details";

type FitDetailsProps = {
    listing: Listing;
};

export function FitDetails({ listing }: FitDetailsProps) {
    const details = getFitDetails(listing);

    return (
        <View style={styles.container}>
            {/* Who it's for */}
            <ThemedView
                type="backgroundElement"
                style={styles.section}
            >
                <ThemedText type="subtitle">
                    Who it&apos;s for
                </ThemedText>

                <ThemedText>{details.audience}</ThemedText>
            </ThemedView>

            {/* Access */}
            <ThemedView
                type="backgroundElement"
                style={styles.section}
            >
                <ThemedText type="subtitle">Access</ThemedText>

                <ThemedText>
                    Environment: {details.environment}
                </ThemedText>

                <ThemedText>
                    Kid-friendly: {details.kidFriendly}
                </ThemedText>

                <ThemedText>
                    Wheelchair accessibility:{" "}
                    {details.wheelchairAccessible}
                </ThemedText>

                <ThemedText>
                    Minimum age: {details.minimumAge}
                </ThemedText>
            </ThemedView>

            {/* Safety */}
            <ThemedView
                type="backgroundElement"
                style={styles.section}
            >
                <ThemedText type="subtitle">Safety</ThemedText>

                <ThemedText>{details.safety}</ThemedText>
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    section: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
});
