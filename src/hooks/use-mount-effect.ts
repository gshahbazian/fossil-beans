import { type EffectCallback, useEffect } from 'react'

export function useMountEffect(effect: EffectCallback) {
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- explicit mount-only escape hatch
  useEffect(effect, [])
}
