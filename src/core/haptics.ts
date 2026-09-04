/**
 * Dokunsal geri bildirim. Web'de sessizce atlanır.
 *
 * Native bir yetenek olduğu için OTA ile sonradan eklenemez — bu yüzden
 * mağaza build'inden önce kuruldu. Kullanımı kısa ve seyrek tutuluyor:
 * cozy bir oyunda sürekli titreşim yorucu olur.
 */
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

let acik = true;

export function toggleHaptics(): boolean {
  acik = !acik;
  return acik;
}

function calisirMi() {
  return acik && Capacitor.isNativePlatform();
}

/** Malzeme elimize geldiğinde. */
export function hapticLight() {
  if (!calisirMi()) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Sürüklerken bir hedefin üstüne gelindiğinde. */
export function hapticSelect() {
  if (!calisirMi()) return;
  void Haptics.selectionChanged().catch(() => {});
}

/** Servis başarılı. */
export function hapticSuccess() {
  if (!calisirMi()) return;
  void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
