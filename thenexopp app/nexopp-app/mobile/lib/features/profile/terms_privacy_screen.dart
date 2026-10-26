import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/partner_ui.dart';
import '../support/support_screen.dart';

typedef PolicySection = ({String title, String body});

class TermsPrivacyScreen extends StatelessWidget {
  const TermsPrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Terms & privacy')),
        body: ListView(padding: const EdgeInsets.all(24), children: [
          const PartnerEyebrow('Understand your partnership'),
          const SizedBox(height: 16),
          const PartnerSurface(
              child: Text(
                  'Project-based draft policies. These documents need business and legal review before publication.',
                  style: TextStyle(
                      color: AppColors.secondaryText,
                      fontSize: 12,
                      height: 1.6))),
          const SizedBox(height: 20),
          _policyLink(context, 'Terms & conditions', Icons.description_outlined,
              _terms),
          const SizedBox(height: 12),
          _policyLink(
              context, 'Privacy policy', Icons.privacy_tip_outlined, _privacy),
          const SizedBox(height: 24),
          Text('Questions about these documents or your account data?',
              style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 16),
          OutlinedButton.icon(
              onPressed: () => _openSupport(context),
              icon: const Icon(Icons.support_agent_rounded),
              label: const Text('Contact partner support')),
        ]),
      );

  Widget _policyLink(BuildContext context, String title, IconData icon,
          List<PolicySection> sections) =>
      Card(
          child: ListTile(
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              leading: Icon(icon, color: AppColors.mutedSage),
              title: Text(title),
              subtitle:
                  const Text('Read in the app', style: TextStyle(fontSize: 12)),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => _PolicyDocumentScreen(
                          title: title, sections: sections)))));

  static void _openSupport(BuildContext context) => Navigator.push(
      context, MaterialPageRoute(builder: (_) => const SupportScreen()));

  static const List<PolicySection> _terms = [
    (
      title: '1. About the service',
      body:
          'TheNexopp Agent supports partner registration, identity verification, property and business listing submissions, commission records, payout history, and support requests. Access to features depends on your account and verification status.'
    ),
    (
      title: '2. Your account',
      body:
          'Provide accurate registration and verification details. Keep your mobile number and sign-in codes secure. Contact partner support if your number changes or you believe someone else has accessed your account.'
    ),
    (
      title: '3. Listings and photos',
      body:
          'Submit accurate property information, locations, prices, and descriptions. Only upload photos and documents you own or have permission to share. Do not submit misleading listings, impersonate another person, or upload unlawful content.'
    ),
    (
      title: '4. Review and availability',
      body:
          'Saving a draft does not submit a listing for review. Submitted listings are reviewed by the platform administration and may be approved, rejected, or returned for clarification. Submission or approval does not guarantee a completed sale, rental, or business transaction.'
    ),
    (
      title: '5. Commissions and payouts',
      body:
          'Earnings and payment records show amounts recorded by administration. Eligibility, amounts, and payment arrangements must be confirmed with the partner desk. A pending balance is not a confirmation that money has already reached your bank account.'
    ),
    (
      title: '6. Account and listing restrictions',
      body:
          'Administration may review listing content and account status. Rejected or suspended accounts may have restricted access. Contact partner support to ask about a decision, request corrections, or report a technical problem.'
    ),
    (
      title: '7. Help and changes',
      body:
          'For questions about your partnership, listing, or payments, use Agent Help & Support or call +91 89775 05204. Review the terms made available by TheNexopp when they are updated. This draft does not record your acceptance of new terms.'
    ),
  ];

  static const List<PolicySection> _privacy = [
    (
      title: '1. Registration and account information',
      body:
          'The app collects the mobile number used for OTP sign-in and the profile details you submit, which may include your name, photo, age, gender, occupation, and operating location. These details support your partner account and administration of the agent network.'
    ),
    (
      title: '2. Identity verification',
      body:
          'KYC submissions include the Aadhaar and PAN information, document photos, locality, and address that you provide. These are used to review identity and verification status. The profile screens display masked identifiers; document images can contain the identifiers printed on them.'
    ),
    (
      title: '3. Bank and payout information',
      body:
          'The app collects the bank account number, IFSC code, UPI ID, and optional PhonePe number you submit. These details support payout administration. Commission amounts, payment history, transaction references, and payment proofs may also be recorded. Bank account numbers are masked in the profile detail screen.'
    ),
    (
      title: '4. Listings and photos',
      body:
          'Property and business submissions include titles, descriptions, prices, categories, specifications, locations, addresses, and photos. Administration uses this information to review and manage listings. Listing content and photos are intended for property promotion; submit only information you are authorized to share.'
    ),
    (
      title: '5. Device permissions and services',
      body:
          'The app requests camera and photo access for uploads, and location access for address detection. You can enter location information manually if location access is unavailable. Sign-in, hosting, file storage, and mapping services may process the information needed to provide their functions. Opening WhatsApp, phone, or other external services is subject to those services’ own policies.'
    ),
    (
      title: '6. Administration and support',
      body:
          'Platform administrators review partner verification, listings, and payout records. Support requests include the subject, description, and any account information needed to investigate the issue. Provide only information relevant to your request.'
    ),
    (
      title: '7. Access, correction, and deletion requests',
      body:
          'Use Agent Help & Support or call +91 89775 05204 to ask what information is held about your account, request corrections or deletion, or raise a privacy concern. You may need to verify your identity. Account deletion is not currently a self-service feature. Ask the partner desk which records can be removed and which must be retained before submitting a request.'
    ),
    (
      title: '8. Questions about this notice',
      body:
          'Contact the partner desk for clarification about data use, service providers, retention, or your choices. This project-based draft does not specify a verified retention schedule or replace a privacy notice approved by the business.'
    ),
  ];
}

class _PolicyDocumentScreen extends StatelessWidget {
  const _PolicyDocumentScreen({required this.title, required this.sections});
  final String title;
  final List<PolicySection> sections;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: Text(title)),
        body: ListView(padding: const EdgeInsets.all(24), children: [
          const PartnerEyebrow('Draft for review'),
          const SizedBox(height: 12),
          Text(title, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 24),
          for (final section in sections) ...[
            Text(section.title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 10),
            SelectableText(section.body,
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(height: 1.7)),
            const SizedBox(height: 24),
          ],
          OutlinedButton.icon(
              onPressed: () => TermsPrivacyScreen._openSupport(context),
              icon: const Icon(Icons.support_agent_rounded),
              label: const Text('Contact partner support')),
        ]),
      );
}
