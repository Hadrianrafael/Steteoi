/**
 * Haptics Service — Empire Clash
 * Centraliza feedback tátil com patterns específicos por ação de jogo.
 * No-op em web/simulador sem suporte a haptics.
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const canHaptic = Platform.OS !== "web";

export const haptic = {
  tap() {
    if (!canHaptic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  click() {
    if (!canHaptic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  play() {
    if (!canHaptic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  },

  success() {
    if (!canHaptic) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  },

  error() {
    if (!canHaptic) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
  },

  warning() {
    if (!canHaptic) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
      () => {},
    );
  },

  victory() {
    if (!canHaptic) return;
    const seq = [0, 80, 160, 280];
    seq.forEach((delay) => {
      setTimeout(
        () =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
            () => {},
          ),
        delay,
      );
    });
  },

  upgrade() {
    if (!canHaptic) return;
    setTimeout(
      () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
      0,
    );
    setTimeout(
      () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => {},
        ),
      100,
    );
    setTimeout(
      () =>
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {}),
      220,
    );
  },

  cardReveal() {
    if (!canHaptic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(
      () =>
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
      80,
    );
  },

  coin() {
    if (!canHaptic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
};
