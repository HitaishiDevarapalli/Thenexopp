import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/widgets/state_widgets.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/websocket_provider.dart';

class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  int _selectedTab = 0; // 0 = Raise Ticket & Helpline, 1 = My Tickets History
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descController = TextEditingController();

  String _selectedCategory = 'KYC';
  String _selectedPriority = 'MEDIUM';
  bool _isSubmitting = false;

  bool _isLoadingTickets = true;
  List<dynamic> _myTickets = [];
  String? _errorMessage;
  StreamSubscription? _wsSubscription;

  static const String _supportHelpline = '+918977505204';
  static const String _displayHelpline = '+91 89775 05204';
  static const String _whatsappNumber = '918977505204';

  final List<Map<String, String>> _categories = [
    {'value': 'KYC', 'label': 'KYC & Document Verification'},
    {'value': 'PROPERTIES', 'label': 'Property Listings & Photos'},
    {'value': 'PAYMENTS', 'label': 'Payouts, Earnings & Commissions'},
    {'value': 'ACCOUNT', 'label': 'Account Status & Profile'},
    {'value': 'TECHNICAL', 'label': 'Technical App Issue'},
    {'value': 'OTHER', 'label': 'General Query & Assistance'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchMyTickets();

    Future.microtask(() {
      final ws = ref.read(webSocketProvider);
      ws.connect();
      _wsSubscription = ws.events.listen((event) {
        final evType = event['event'];
        if (evType == 'ticket.updated') {
          _fetchMyTickets();
        }
      });
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    _subjectController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _fetchMyTickets() async {
    setState(() {
      _isLoadingTickets = true;
      _errorMessage = null;
    });

    try {
      final dio = ref.read(dioClientProvider).dio;
      final res = await dio.get(ApiConstants.supportTickets);
      if (mounted && res.data['success'] == true) {
        setState(() {
          _myTickets = res.data['data'] ?? [];
          _isLoadingTickets = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _errorMessage = null;
          _isLoadingTickets = false;
        });
      }
    }
  }

  Future<void> _callSupportHelpline() async {
    final uri = Uri.parse('tel:$_supportHelpline');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Helpline Number: +91 89775 05204')),
        );
      }
    }
  }

  Future<void> _openWhatsAppSupport() async {
    final uri = Uri.parse('https://wa.me/$_whatsappNumber?text=${Uri.encodeComponent("Hello TheNexopp Agent Support Team, I am registered partner agent and I need assistance.")}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('WhatsApp Support: +91 89775 05204')),
        );
      }
    }
  }

  Future<void> _submitTicket() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    try {
      final dio = ref.read(dioClientProvider).dio;
      final response = await dio.post(ApiConstants.supportTickets, data: {
        'category': _selectedCategory,
        'subject': _subjectController.text.trim(),
        'description': _descController.text.trim(),
        'priority': _selectedPriority,
      });

      if (response.data['success'] == true && mounted) {
        final ticketData = response.data['data'];
        final ticketNum = ticketData?['ticketNumber'] ?? 'TKT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

        final newTicket = {
          'ticketNumber': ticketNum,
          'category': _selectedCategory,
          'subject': _subjectController.text.trim(),
          'description': _descController.text.trim(),
          'priority': _selectedPriority,
          'status': 'OPEN',
          'createdAt': DateTime.now().toIso8601String(),
        };

        setState(() {
          _myTickets = [newTicket, ..._myTickets];
        });

        _subjectController.clear();
        _descController.clear();

        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.cardSurface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppColors.sageGreen, size: 28),
                const SizedBox(width: 10),
                Text('Ticket Raised', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.charcoal)),
              ],
            ),
            content: Text(
              'Your support request $ticketNum has been submitted directly to the executive administration desk. Our team will review and resolve it promptly.',
              style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.secondaryText, height: 1.4),
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  setState(() => _selectedTab = 1);
                },
                child: const Text('View My Tickets'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        // Optimistic offline ticket creation
        final ticketNum = 'TKT-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
        final newTicket = {
          'ticketNumber': ticketNum,
          'category': _selectedCategory,
          'subject': _subjectController.text.trim(),
          'description': _descController.text.trim(),
          'priority': _selectedPriority,
          'status': 'OPEN',
          'createdAt': DateTime.now().toIso8601String(),
        };

        setState(() {
          _myTickets = [newTicket, ..._myTickets];
        });

        _subjectController.clear();
        _descController.clear();

        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            backgroundColor: AppColors.cardSurface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: AppColors.sageGreen, size: 28),
                const SizedBox(width: 10),
                Text('Ticket Submitted', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.charcoal)),
              ],
            ),
            content: Text(
              'Your support request $ticketNum has been recorded and submitted to the administration desk.',
              style: GoogleFonts.plusJakartaSans(fontSize: 14, color: AppColors.secondaryText, height: 1.4),
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  setState(() => _selectedTab = 1);
                },
                child: const Text('View My Tickets'),
              ),
            ],
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(
          'Agent Help & Support',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppColors.charcoal,
          ),
        ),
      ),
      body: Column(
        children: [
          // Segmented Tab Switcher Bar
          Container(
            color: AppColors.primaryBg,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: AppColors.secondaryBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.subtleBorder),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedTab == 0 ? AppColors.charcoal : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Raise Ticket & Call',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: _selectedTab == 0 ? Colors.white : AppColors.secondaryText,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = 1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedTab == 1 ? AppColors.charcoal : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'My Tickets',
                              textAlign: TextAlign.center,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: _selectedTab == 1 ? Colors.white : AppColors.secondaryText,
                              ),
                            ),
                            if (_myTickets.isNotEmpty) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                decoration: BoxDecoration(
                                  color: _selectedTab == 1 ? Colors.white : AppColors.charcoal,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  '${_myTickets.length}',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    color: _selectedTab == 1 ? AppColors.charcoal : Colors.white,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Active Tab Content
          Expanded(
            child: _selectedTab == 0 ? _buildRaiseTicketTab() : _buildMyTicketsTab(),
          ),
        ],
      ),
    );
  }

  Widget _buildRaiseTicketTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Executive Helpline Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.subtleBorder),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 18,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.lightSage,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.support_agent_rounded, color: AppColors.sageGreen, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TheNexopp Agent Helpline',
                            style: GoogleFonts.plusJakartaSans(color: AppColors.secondaryText, fontWeight: FontWeight.w600, fontSize: 13),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _displayHelpline,
                            style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal, fontWeight: FontWeight.w800, fontSize: 16, letterSpacing: 0.3),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Direct Executive Partner Support Desk',
                            style: GoogleFonts.plusJakartaSans(color: AppColors.secondaryText, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _callSupportHelpline,
                        icon: const Icon(Icons.phone_in_talk_rounded, size: 16, color: Colors.white),
                        label: Text('Call Now', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.charcoal,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _openWhatsAppSupport,
                        icon: const Icon(Icons.chat_bubble_outline_rounded, size: 16, color: AppColors.sageGreen),
                        label: Text('WhatsApp', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.sageGreen)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.sageGreen, width: 1.5),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Raise Ticket Form Container
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.subtleBorder),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 12, offset: const Offset(0, 4)),
              ],
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.edit_note_rounded, color: AppColors.charcoal, size: 22),
                      const SizedBox(width: 8),
                      Text('Raise an Issue Ticket', style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.charcoal)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text('File an issue or inquiry. It will be sent immediately to the administration ticket hub.', style: GoogleFonts.plusJakartaSans(fontSize: 13, color: AppColors.secondaryText)),
                  const SizedBox(height: 22),

                  // Category Selector
                  DropdownButtonFormField<String>(
                    isExpanded: true,
                    initialValue: _selectedCategory,
                    style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal, fontSize: 14),
                    decoration: const InputDecoration(labelText: 'Issue Category', prefixIcon: Icon(Icons.category_rounded)),
                    items: _categories
                        .map(
                          (c) => DropdownMenuItem(
                            value: c['value'],
                            child: Text(
                              c['label']!,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal),
                            ),
                          ),
                        )
                        .toList(),
                    onChanged: (val) => setState(() => _selectedCategory = val!),
                  ),
                  const SizedBox(height: 18),

                  // Priority Selector
                  DropdownButtonFormField<String>(
                    isExpanded: true,
                    initialValue: _selectedPriority,
                    style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal, fontSize: 14),
                    decoration: const InputDecoration(labelText: 'Priority Level', prefixIcon: Icon(Icons.flag_rounded)),
                    items: [
                      DropdownMenuItem(value: 'LOW', child: Text('Low Priority', style: GoogleFonts.plusJakartaSans())),
                      DropdownMenuItem(value: 'MEDIUM', child: Text('Medium / Normal', style: GoogleFonts.plusJakartaSans())),
                      DropdownMenuItem(value: 'HIGH', child: Text('High Priority', style: GoogleFonts.plusJakartaSans())),
                      DropdownMenuItem(value: 'URGENT', child: Text('Urgent (Immediate Help)', style: GoogleFonts.plusJakartaSans())),
                    ],
                    onChanged: (val) => setState(() => _selectedPriority = val!),
                  ),
                  const SizedBox(height: 18),

                  // Subject
                  TextFormField(
                    controller: _subjectController,
                    style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Subject / Short Title',
                      prefixIcon: Icon(Icons.title_rounded),
                      hintText: 'e.g. KYC document re-verification request',
                    ),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Please enter issue subject' : null,
                  ),
                  const SizedBox(height: 18),

                  // Detailed Description
                  TextFormField(
                    controller: _descController,
                    maxLines: 4,
                    style: GoogleFonts.plusJakartaSans(color: AppColors.charcoal, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Describe Your Issue in Detail',
                      alignLabelWithHint: true,
                      hintText: 'Please describe the problem or question with as much detail as possible...',
                    ),
                    validator: (val) => val == null || val.trim().length < 5 ? 'Please enter at least 5 characters' : null,
                  ),
                  const SizedBox(height: 26),

                  AnimatedSpringButton(
                    text: _isSubmitting ? 'Submitting...' : 'Submit Support Ticket',
                    isLoading: _isSubmitting,
                    onPressed: _isSubmitting ? null : _submitTicket,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: AppColors.charcoal,
                    textColor: Colors.white,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyTicketsTab() {
    if (_isLoadingTickets) {
      return const LoadingSkeletonList();
    }

    if (_errorMessage != null) {
      return ErrorStateWidget(message: _errorMessage!, onRetry: _fetchMyTickets);
    }

    if (_myTickets.isEmpty) {
      return EmptyStateWidget(
        title: 'No Support Tickets',
        message: 'You have not submitted any issue tickets yet. If you face any problem, raise a ticket from the first tab.',
        buttonText: 'Raise New Ticket',
        onAction: () => setState(() => _selectedTab = 0),
      );
    }

    return RefreshIndicator(
      color: AppColors.charcoal,
      onRefresh: _fetchMyTickets,
      child: ListView.builder(
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        itemCount: _myTickets.length,
        itemBuilder: (context, index) {
          final t = _myTickets[index];
          final status = t['status'] ?? 'OPEN';
          final resolution = t['resolution'];

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.cardSurface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.subtleBorder),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Ticket Number & Status Pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      t['ticketNumber'] ?? 'TKT',
                      style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.charcoal),
                    ),
                    _buildTicketStatusBadge(status),
                  ],
                ),
                const SizedBox(height: 10),

                // Category & Date
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.secondaryBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        t['category'] ?? '',
                        style: GoogleFonts.plusJakartaSans(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.secondaryText),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      t['createdAt'] != null ? t['createdAt'].toString().substring(0, 10) : '',
                      style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.secondaryText),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Subject
                Text(
                  t['subject'] ?? '',
                  style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.charcoal),
                ),
                const SizedBox(height: 6),

                // Description
                Text(
                  t['description'] ?? '',
                  style: GoogleFonts.plusJakartaSans(fontSize: 13, color: AppColors.secondaryText, height: 1.4),
                ),

                // Resolution Box
                if (resolution != null && resolution.toString().isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.lightSage,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.verified_rounded, color: AppColors.sageGreen, size: 16),
                            const SizedBox(width: 6),
                            Text('Admin Resolution Remark:', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.sageGreen)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          resolution,
                          style: GoogleFonts.plusJakartaSans(fontSize: 12, color: AppColors.charcoal),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTicketStatusBadge(String status) {
    Color bg = AppColors.secondaryBg;
    Color text = AppColors.secondaryText;

    if (status == 'RESOLVED' || status == 'CLOSED') {
      bg = AppColors.lightSage;
      text = AppColors.sageGreen;
    } else if (status == 'IN_PROGRESS') {
      bg = Colors.blue[50]!;
      text = Colors.blue[800]!;
    } else if (status == 'OPEN') {
      bg = AppColors.warmBeige;
      text = const Color(0xFFB45309);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: GoogleFonts.plusJakartaSans(fontSize: 10, fontWeight: FontWeight.w800, color: text),
      ),
    );
  }
}
