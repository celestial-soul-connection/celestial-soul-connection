/**
 * OtpBoxes — premium segmented code input (Hinge/Twilio-grade).
 *
 * Pattern: ONE hidden full-width TextInput overlaid on visually-rendered boxes
 * (flawless SMS autofill + paste). Each filled box scales-in with a spring; the
 * active box shows an accent border + blinking caret; a wrong code triggers a
 * decaying horizontal shake + error haptic + auto-clear. Auto-submits on the
 * last digit after a deliberate ~250ms "let them see it" pause.
 */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, withRepeat, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { haptic } from '../../lib/haptics';

export interface OtpBoxesRef { shakeError: () => void; clear: () => void; }

interface Props {
  length?: number;
  onComplete: (code: string) => void;
}

export const OtpBoxes = forwardRef<OtpBoxesRef, Props>(({ length = 6, onComplete }, ref) => {
  const t = useTheme();
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);
  const shake = useSharedValue(0);

  useImperativeHandle(ref, () => ({
    shakeError: () => {
      haptic.error?.();
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      setTimeout(() => setCode(''), 380);
    },
    clear: () => setCode(''),
  }));

  const onChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, length);
    setCode(digits);
    if (digits.length === length) {
      setTimeout(() => onComplete(digits), 250); // let them SEE the last box fill
    }
  };

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <Animated.View style={[{ flexDirection: 'row', justifyContent: 'space-between' }, rowStyle]}>
        {Array.from({ length }).map((_, i) => (
          <Box key={i} t={t} char={code[i]} active={i === code.length} filled={i < code.length} />
        ))}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={onChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        maxLength={length}
        // hidden but focusable & full-width for paste/autofill
        style={{ position: 'absolute', width: '100%', height: 64, opacity: 0 }}
      />
    </Pressable>
  );
});

function Box({ t, char, active, filled }: { t: ReturnType<typeof useTheme>; char?: string; active: boolean; filled: boolean }) {
  const scale = useSharedValue(filled ? 1 : 0.8);
  const caret = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(filled ? 1 : 0.85, { damping: 15, stiffness: 200 });
  }, [filled, scale]);

  useEffect(() => {
    caret.value = active ? withRepeat(withTiming(1, { duration: 600, easing: Easing.ease }), -1, true) : withTiming(0);
  }, [active, caret]);

  const digitStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: filled ? 1 : 0 }));
  const caretStyle = useAnimatedStyle(() => ({ opacity: caret.value }));

  return (
    <View
      style={{
        width: 50, height: 62, borderRadius: 14,
        borderWidth: active ? 2 : 1.5,
        borderColor: active ? t.colors.primary : filled ? t.colors.borderStrong : t.colors.border,
        backgroundColor: t.colors.bgElevated,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: active ? t.colors.primary : 'transparent',
        shadowOpacity: active ? 0.25 : 0, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
      }}>
      <Animated.View style={digitStyle}>
        <Text variant="displayLg" color="text">{char ?? ''}</Text>
      </Animated.View>
      {active && !filled && (
        <Animated.View style={[{ position: 'absolute', width: 2, height: 26, backgroundColor: t.colors.primary, borderRadius: 2 }, caretStyle]} />
      )}
    </View>
  );
}
