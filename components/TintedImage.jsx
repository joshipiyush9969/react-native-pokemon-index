import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const TintedImage = ({ imagePath, tintStyle, imageSize, tintRadius }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tintStyle, borderRadius: tintRadius },
      ]}
    >
      <Image source={imagePath} style={[styles.image, imageSize]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",

    marginHorizontal: 5,

    padding: 10,
    borderRadius: 50,
  },
  image: {
    resizeMode: "contain",
  },
});

export default TintedImage;
