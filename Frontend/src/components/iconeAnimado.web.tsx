import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, { Keyframe, Easing } from "react-native-reanimated";

const DURATION = 300;

export function AnimatedSplashOverlay() {
  return null;
}

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 1.1 }],
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={styles.imageContainer}
        entering={logoKeyframe.duration(DURATION)}
      >
        <Image
          style={styles.image}
          source={require("@/assets/logo.png")}
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 220,
    height: 120,
    zIndex: 100,
  },
  image: {
    width: 220,
    height: 120,
  },
});
