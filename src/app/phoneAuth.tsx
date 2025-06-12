import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import CustomButton from '../components/common/CustomButton';
import RotatingLogo from '../components/common/RotatingLogo';
import { AuthType } from '../constants/types/auth.types';
import { useAuth } from '../context/AuthContext';
import { verifyOTP } from '../service/auth.service';
import { logger } from '../service/logger.service';
import { createUser } from '../service/user.service';
import { useUserStore } from '../store/userStore';

const PhoneAuthScreen = () => {
  const router = useRouter();
  const { authType } = useLocalSearchParams<{ authType: AuthType }>()
  const { login } = useAuth();
  const { setUser } = useUserStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setPhone(cleaned);
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length <= 6) {
      setCode(cleaned);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    Keyboard.dismiss();

    const formattedPhone = `+${callingCode}${phone}`;

    const sendiMessage = (message: string) => {
      const url = `sms:${`sixmessage@a.imsg.co`}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(err => console.error('Error opening iMessage:', err));
    };

    setIsCodeSent(true);
    sendiMessage(`Send this message to get otp from Six`)
    // Start animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    Keyboard.dismiss();

    const formattedPhone = `+${callingCode}${phone}`;
    const response = await verifyOTP(formattedPhone, code, authType);
    if (response.success) {
      const userData = {
        id: response.data.id,
        phone: response.data.phone
      };
      logger.info('handleLogin', 'userData', userData)
      setUser({ id: userData.id, phone: userData.phone });

      if (authType === AuthType.SignUp && response.isNewUser) {
        const user = await createUser(userData);
        if (user.success) router.replace('/enterName');
      } else {
        login(userData);
        router.push('/')
      }
    } else {
      logger.error('handleLogin', 'Failed to verify OTP:', response.error);
      Alert.alert('Failed to verify OTP');
      router.back();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <RotatingLogo />
      </View>

      <Text style={styles.heading}>Let's Begin</Text>
      <Text style={styles.subheading}>
        {isCodeSent
          ? "Enter the code we sent you"
          : "We'll text you a code to confirm your number"
        }
      </Text>

      {!isCodeSent ? (
        <>
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity
              style={styles.countryPicker}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryCode}>+{callingCode}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              placeholderTextColor={'#000'}
              value={phone}
              onChangeText={handlePhoneChange}
              maxLength={10}
            />

            <CountryPicker
              countryCode={countryCode}
              withFilter
              withFlag
              withCallingCode
              visible={showCountryPicker}
              onSelect={onSelectCountry}
              onClose={() => setShowCountryPicker(false)}
              containerButtonStyle={styles.invisiblePicker}
            />
          </View>
          <CustomButton
            title="Join Six"
            onPress={handleSendCode}
            loading={loading}
            disabled={phone.length < 10}
          />
        </>
      ) : (
        <Animated.View
          style={[
            styles.codeContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            value={code}
            placeholderTextColor={'#000'}
            onChangeText={handleCodeChange}
            maxLength={6}
          />
          <CustomButton
            title="Verify Code"
            onPress={handleLogin}
            loading={loading}
            disabled={code.length !== 6}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  logoContainer: {
    paddingVertical: 50
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    color: '#000',
  },
  invisiblePicker: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  codeContainer: {
    width: '100%',
    alignItems: 'center',
  },
});

export default PhoneAuthScreen;
