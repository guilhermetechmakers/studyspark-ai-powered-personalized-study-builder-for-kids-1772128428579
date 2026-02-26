/**
 * Static Terms of Service content for StudySpark.
 * Localization-ready: structure supports i18n JSON replacement.
 */
import type { ToSContent } from '@/types/terms-of-service'

export const TOS_CONTENT: ToSContent = {
  version: '1.0',
  effectiveDate: '2025-02-26',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      blocks: [
        {
          type: 'p',
          text: 'Welcome to StudySpark. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services. StudySpark provides AI-powered personalized study materials for K–12 children, designed to be trustworthy, fast, and parent-controlled.',
        },
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use and User Responsibilities',
      blocks: [
        {
          type: 'p',
          text: 'You agree to use StudySpark only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.',
        },
        {
          type: 'h3',
          text: 'You agree not to:',
        },
        {
          type: 'ul',
          items: [
            'Use the service in any way that violates applicable laws or regulations',
            'Upload, share, or transmit content that is harmful, offensive, or inappropriate for children',
            'Attempt to gain unauthorized access to our systems, other accounts, or third-party services',
            'Interfere with or disrupt the integrity or performance of the service',
            'Use the service to harass, abuse, or harm others',
            'Circumvent any security or access controls',
          ],
        },
        {
          type: 'p',
          text: 'Parents and guardians are responsible for supervising their children\'s use of StudySpark and ensuring that use complies with these Terms.',
        },
      ],
    },
    {
      id: 'content-ownership',
      title: 'Content Ownership, Rights, and License Grants',
      blocks: [
        {
          type: 'p',
          text: 'You retain ownership of all content you upload to StudySpark, including study materials, notes, and other user-generated content.',
        },
        {
          type: 'p',
          text: 'By uploading content, you grant StudySpark a non-exclusive, royalty-free, worldwide license to use, store, process, display, and distribute your content solely for the purpose of providing and improving our services. This includes generating personalized study materials and displaying content to you and your designated child profiles.',
        },
        {
          type: 'p',
          text: 'StudySpark and its licensors own all rights in the platform, including software, design, branding, and documentation. You may not copy, modify, or create derivative works without our written permission.',
        },
      ],
    },
    {
      id: 'liability',
      title: 'Liability Limitations and Disclaimers',
      blocks: [
        {
          type: 'p',
          text: 'StudySpark is provided "as is" and "as available." We disclaim all warranties, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.',
        },
        {
          type: 'p',
          text: 'To the maximum extent permitted by law, StudySpark and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of the service.',
        },
        {
          type: 'p',
          text: 'Our total liability for any claims arising from these Terms or your use of the service shall not exceed the amount you paid to StudySpark in the twelve (12) months preceding the claim, or one hundred dollars ($100), whichever is greater.',
        },
      ],
    },
    {
      id: 'termination',
      title: 'Termination and Modification',
      blocks: [
        {
          type: 'p',
          text: 'We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our discretion. You may terminate your account at any time through your account settings.',
        },
        {
          type: 'p',
          text: 'We may modify these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the effective date. Your continued use of the service after such changes constitutes acceptance of the new Terms.',
        },
        {
          type: 'p',
          text: 'If we make material changes that affect your rights, we may also notify you by email or through an in-app notice. We encourage you to review these Terms periodically.',
        },
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy and Data Handling',
      blocks: [
        {
          type: 'p',
          text: 'Your use of StudySpark is also governed by our Privacy Policy, which describes how we collect, use, and protect your information. By using our service, you consent to our data practices as described in the Privacy Policy.',
        },
        {
          type: 'p',
          text: 'We take special care with children\'s data and comply with applicable laws such as COPPA. Parents and guardians control their children\'s profiles and can request deletion of data at any time.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing Law and Dispute Resolution',
      blocks: [
        {
          type: 'p',
          text: 'These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.',
        },
        {
          type: 'p',
          text: 'Any dispute arising from these Terms or your use of the service shall first be attempted to be resolved through good-faith negotiation. If resolution cannot be reached within thirty (30) days, either party may pursue binding arbitration in accordance with the rules of the American Arbitration Association.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact Information and Update Notices',
      blocks: [
        {
          type: 'p',
          text: 'If you have questions about these Terms of Service, please contact us at:',
        },
        {
          type: 'ul',
          items: [
            'Email: legal@studyspark.com',
            'Address: StudySpark, Inc., 123 Education Way, Wilmington, DE 19801',
          ],
        },
        {
          type: 'p',
          text: 'We will respond to inquiries within a reasonable timeframe. For urgent matters, please use the support form in the Help section of our application.',
        },
      ],
    },
  ],
}
