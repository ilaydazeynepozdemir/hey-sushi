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

export function titresimAcKapa(): boolean {
  acik = !acik;
  return acik;
}

function calisirMi() {
  return acik && Capacitor.isNativePlatform();
}

/** Malzeme elimize geldiğinde. */
export function titresimHafif() {
  if (!calisirMi()) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Sürüklerken bir hedefin üstüne gelindiğinde. */
export function titresimSecim() {
  if (!calisirMi()) return;
  void Haptics.selectionChanged().catch(() => {});
}

/** Servis başarılı. */
export function titresimBasari() {
  if (!calisirMi()) return;
  void Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
