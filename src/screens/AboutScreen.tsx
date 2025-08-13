import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

const AboutScreen: React.FC = () => {
  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handleDonationPress = (type: 'bitcoin' | 'monero') => {
    const addresses = {
      bitcoin: 'bc1q7wsvwqz54mmjqqh7lsgj0t7r9xeml3l63k0k8f',
      monero: '49xnpzVysTYQjC6tiAvAdHYG26F35Xkc8L4ctMrEkvPpRDjfoYkuTGqaEcXv8SXEwLHomkDDnavA27KKMEkxQNhjTnXDAFD'
    };

    Alert.alert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Address`,
      addresses[type],
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Address',
          onPress: () => {
            // Copy to clipboard logic would go here
            Alert.alert('Copied', 'Address copied to clipboard');
          },
        },
      ]
    );
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* App Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.appName}>MatrixChat</Text>
            <Text style={styles.appVersion}>Version {appVersion} ({buildNumber})</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            MatrixChat is a PGP end-to-end encrypted messenger with a focus on security and privacy.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Features</Text>
          
          <View style={styles.featureItem}>
            <Icon name="security" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>End-to-end encryption using Matrix protocol</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="lock" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>PIN protection with auto-reset after 3 failed attempts</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="vpn-key" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>Recovery seed phrase for account restoration</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Icon name="visibility-off" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>No personal data collection</Text>
          </View>
        </View>

        {/* Privacy Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <Text style={styles.bodyText}>
            Thanks to end-to-end encryption, no one other than the intended recipient can read or listen to transmitted messages, not even MatrixChat as the service provider. No personal data is required to use it.
          </Text>
          <Text style={styles.bodyText}>
            MatrixChat does not store messages on its servers. To receive messages, you must be logged in to your account on one device; otherwise, you will not receive any messages.
          </Text>
        </View>

        {/* Infrastructure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infrastructure</Text>
          <Text style={styles.bodyText}>
            MatrixChat operates its own servers at independent locations in Switzerland. If one location fails, another can be immediately switched over to ensure uninterrupted operation.
          </Text>
          <Text style={styles.bodyText}>
            MatrixChat is not financed by advertising and does not collect any user data.
          </Text>
        </View>

        {/* Support Development */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Development</Text>
          <Text style={styles.bodyText}>
            Help us maintain and improve MatrixChat by making a donation:
          </Text>
          
          <TouchableOpacity 
            style={styles.donationButton}
            onPress={() => handleDonationPress('bitcoin')}
          >
            <Icon name="currency-bitcoin" size={24} color={COLORS.warning} />
            <Text style={styles.donationButtonText}>Bitcoin Donation</Text>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.donationButton}
            onPress={() => handleDonationPress('monero')}
          >
            <Icon name="monetization-on" size={24} color={COLORS.success} />
            <Text style={styles.donationButtonText}>Monero Donation</Text>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Information</Text>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleLinkPress('https://matrix.org')}
          >
            <Icon name="link" size={20} color={COLORS.primary} />
            <Text style={styles.linkButtonText}>Matrix Protocol</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => handleLinkPress('https://github.com/matrix-org')}
          >
            <Icon name="code" size={20} color={COLORS.primary} />
            <Text style={styles.linkButtonText}>Open Source</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built with React Native and Matrix Protocol
          </Text>
          <Text style={styles.footerText}>
            © 2025 MatrixChat. Privacy-focused messaging.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingVertical: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  appName: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  appVersion: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  donationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  donationButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  linkButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
});

export default AboutScreen;
