import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/** Feedback tátil leve — ignora falhas em web/ambientes sem suporte. */
export async function feedbackTactilLeve(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Ambiente sem haptics (simulador, web, etc.)
  }
}
