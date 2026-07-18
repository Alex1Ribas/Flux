import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe, runOnJS } from "react-native-reanimated";

const DURATION = 600;
const FUNDO_MARCA = "#F8FAF5";

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  const image = (
    <Image
      style={styles.image}
      source={require("@/assets/logo.png")}
      contentFit="contain"
    />
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        "worklet";
        if (finished) {
          runOnJS(setVisible)(false);
        }
      })}
      style={styles.splashOverlay}
    >
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {image}
    </View>
  );
}

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.1 }],
    opacity: 0,
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
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
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: FUNDO_MARCA,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
