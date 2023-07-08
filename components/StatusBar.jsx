import React from "react";
import { View, Text, StyleSheet } from "react-native";

const StatsBar = ({ stats, capitalizeFirstLetter }) => {
  return (
    <View>
      {stats.map((stat) => (
        <View style={styles.statContainer} key={stat.pokemon_v2_stat.name}>
          <Text style={styles.statName}>
            {capitalizeFirstLetter(
              stat.pokemon_v2_stat.name === "special-attack"
                ? "SA"
                : stat.pokemon_v2_stat.name === "special-defense"
                ? "SD"
                : stat.pokemon_v2_stat.name
            )}
          </Text>
          <View style={styles.statBar}>
            <View
              style={[styles.statBarFill, { width: stat.base_stat }]}
            ></View>
          </View>
          <Text style={styles.statValue}>{stat.base_stat}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statName: {
    marginRight: 10,
    width: 60,
    textAlign: "left",
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  statBar: {
    flex: 1,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  statBarFill: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  statValue: {
    width: 30,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 15,
  },
});

export default StatsBar;
