import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/permission_service.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/auth_provider.dart';

class KycOnboardingScreen extends ConsumerStatefulWidget {
  const KycOnboardingScreen({super.key});

  @override
  ConsumerState<KycOnboardingScreen> createState() => _KycOnboardingScreenState();
}

class _KycOnboardingScreenState extends ConsumerState<KycOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _aadhaarController = TextEditingController();
  final _panController = TextEditingController();
  final _areaController = TextEditingController();
  final _addressController = TextEditingController();

  XFile? _aadhaarFile;
  XFile? _panFile;
  bool _isLoading = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void dispose() {
    _aadhaarController.dispose();
    _panController.dispose();
    _areaController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(bool isAadhaar) async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Wrap(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Text(
                isAadhaar ? 'Upload Aadhaar Card Photo' : 'Upload PAN Card Photo',
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textDark),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.camera_alt_rounded, color: AppColors.primaryEmerald),
              title: const Text('Take Photo with Camera', style: TextStyle(fontWeight: FontWeight.w500)),
              onTap: () async {
                Navigator.pop(ctx);
                final hasPerm = await PermissionService.checkAndRequestCameraPermission(context);
                if (!hasPerm && mounted) return;
                final XFile? image = await _picker.pickImage(
                  source: ImageSource.camera,
                  imageQuality: 70,
                  maxWidth: 1280,
                  maxHeight: 1280,
                );
                if (image != null && mounted) {
                  setState(() {
                    if (isAadhaar) _aadhaarFile = image;
                    else _panFile = image;
                  });
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_rounded, color: AppColors.primaryEmerald),
              title: const Text('Choose from Gallery', style: TextStyle(fontWeight: FontWeight.w500)),
              onTap: () async {
                Navigator.pop(ctx);
                final hasPerm = await PermissionService.checkAndRequestStoragePermission(context);
                if (!hasPerm && mounted) return;
                final XFile? image = await _picker.pickImage(
                  source: ImageSource.gallery,
                  imageQuality: 70,
                  maxWidth: 1280,
                  maxHeight: 1280,
                );
                if (image != null && mounted) {
                  setState(() {
                    if (isAadhaar) _aadhaarFile = image;
                    else _panFile = image;
                  });
                }
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<String> _uploadFile(XFile file, String bucketType) async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final bytes = await file.readAsBytes();
      final rawName = file.name.trim();
      final ext = rawName.contains('.') ? rawName.split('.').last.toLowerCase() : 'jpg';
      final safeExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].contains(ext) ? ext : 'jpg';
      final mimeType = safeExt == 'png' ? 'image/png' : safeExt == 'webp' ? 'image/webp' : safeExt == 'pdf' ? 'application/pdf' : 'image/jpeg';
      final base64String = 'data:$mimeType;base64,${base64Encode(bytes)}';

      final res = await dio.post(ApiConstants.directUpload, data: {
        'bucketType': bucketType,
        'base64Data': base64String,
        'filename': file.name,
      });

      if (res.data['success'] == true) {
        final fileKey = res.data['data']['fileKey']?.toString();
        if (fileKey != null && fileKey.isNotEmpty) return fileKey;
      }
    } catch (e) {
      debugPrint('[KYCOnboarding] Upload note: $e');
    }
    return 'kyc-doc-${DateTime.now().millisecondsSinceEpoch}-${file.name.replaceAll(' ', '_')}';
  }

  Future<void> _submitKyc() async {
    if (!_formKey.currentState!.validate()) return;
    if (_aadhaarFile == null || _panFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select both Aadhaar and PAN documents'), backgroundColor: AppColors.statusError),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      String? aadhaarKey = await _uploadFile(_aadhaarFile!, 'private-kyc');
      if (aadhaarKey == null || aadhaarKey.startsWith('kyc-doc-')) {
        final bytes = await _aadhaarFile!.readAsBytes();
        aadhaarKey = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }

      String? panKey = await _uploadFile(_panFile!, 'private-kyc');
      if (panKey == null || panKey.startsWith('kyc-doc-')) {
        final bytes = await _panFile!.readAsBytes();
        panKey = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }

      final dio = ref.read(dioClientProvider).dio;
      final payload = {
        'aadhaarNumber': _aadhaarController.text.trim().replaceAll(' ', ''),
        'panNumber': _panController.text.trim().toUpperCase(),
        'aadhaarDocKey': aadhaarKey,
        'panDocKey': panKey,
        'area': _areaController.text.trim(),
        'addressDetails': _addressController.text.trim(),
      };

      final response = await dio.post(ApiConstants.submitKyc, data: payload);

      if (response.statusCode == 200 || response.data?['success'] == true) {
        if (mounted) {
          ref.read(authProvider.notifier).updateAgentState('BANK_DETAILS_INCOMPLETE');
        }
      } else {
        final msg = response.data?['message']?.toString() ?? 'Failed to submit KYC documents.';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(msg), backgroundColor: AppColors.statusError),
          );
        }
      }
    } catch (e) {
      debugPrint('[KYC] Error: $e');
      String errorMsg = 'Failed to submit KYC. Please check your document numbers, address details, and photos.';
      if (e is DioException && e.response?.data is Map) {
        final backendMsg = e.response?.data['message'];
        if (backendMsg is List) {
          errorMsg = backendMsg.join(', ');
        } else if (backendMsg != null) {
          errorMsg = backendMsg.toString();
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMsg), backgroundColor: AppColors.statusError),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Identity KYC (Step 2 of 3)')),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const LinearProgressIndicator(value: 0.66, backgroundColor: AppColors.borderLight, color: AppColors.secondaryGreen),
                const SizedBox(height: 24),
                const Text('KYC Verification', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textDark)),
                const SizedBox(height: 8),
                const Text('Documents & mandatory address are encrypted and stored in private storage.', style: TextStyle(fontSize: 14, color: AppColors.textMedium)),
                const SizedBox(height: 28),
                TextFormField(
                  controller: _areaController,
                  textCapitalization: TextCapitalization.words,
                  decoration: const InputDecoration(
                    labelText: 'Area / Colony / Locality *',
                    hintText: 'e.g. SVN Colony, Madhapur, Brodipet',
                    helperText: 'Mandatory field: Enter your locality or colony name',
                    prefixIcon: Icon(Icons.location_city_rounded),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Area / Colony / Locality is a mandatory field';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _addressController,
                  maxLines: 2,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    labelText: 'Full Address Details *',
                    hintText: 'Door No / House Name, Street, Landmark, Pincode',
                    helperText: 'Mandatory field: Enter complete street address',
                    prefixIcon: Icon(Icons.home_work_rounded),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Full Address Details is a mandatory field';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _aadhaarController,
                  keyboardType: TextInputType.number,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(12),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'Aadhaar Number (12 Digits) *',
                    hintText: 'e.g. 123456789012',
                    helperText: 'Must be exactly 12 numeric digits',
                    prefixIcon: Icon(Icons.badge_rounded),
                    counterText: '',
                  ),
                  validator: (val) {
                    final clean = val?.replaceAll(' ', '') ?? '';
                    if (clean.length != 12) return 'Aadhaar must be exactly 12 digits';
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                _buildUploadBox('Aadhaar Document Photo', _aadhaarFile, () => _pickImage(true)),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _panController,
                  textCapitalization: TextCapitalization.characters,
                  inputFormatters: [
                    LengthLimitingTextInputFormatter(10),
                    FilteringTextInputFormatter.allow(RegExp(r'[a-zA-Z0-9]')),
                  ],
                  decoration: const InputDecoration(
                    labelText: 'PAN Number (10 Characters) *',
                    hintText: 'e.g. ABCDE1234F',
                    helperText: '5 letters, 4 numbers, 1 letter (10 chars)',
                    prefixIcon: Icon(Icons.credit_card_rounded),
                    counterText: '',
                  ),
                  validator: (val) {
                    final clean = val?.trim().toUpperCase() ?? '';
                    if (clean.length != 10) return 'PAN must be exactly 10 characters';
                    if (!RegExp(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$').hasMatch(clean)) {
                      return 'Enter valid PAN (e.g. ABCDE1234F)';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                _buildUploadBox('PAN Card Photo', _panFile, () => _pickImage(false)),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _isLoading ? null : _submitKyc,
                  child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Submit KYC & Continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildUploadBox(String title, XFile? file, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: file != null ? AppColors.secondaryGreen : AppColors.borderLight),
          borderRadius: BorderRadius.circular(10),
          color: file != null ? AppColors.secondaryGreenLight.withAlpha(76) : AppColors.inputFill,
        ),
        child: Row(
          children: [
            Icon(file != null ? Icons.check_circle_rounded : Icons.cloud_upload_rounded,
                color: file != null ? AppColors.secondaryGreen : AppColors.primaryNavy),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                file != null ? 'Selected: ${file.name}' : 'Upload $title',
                style: TextStyle(fontWeight: FontWeight.w600, color: file != null ? AppColors.secondaryGreenDark : AppColors.textDark),
              ),
            ),
            Text(file != null ? 'Change' : 'Browse', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryNavy)),
          ],
        ),
      ),
    );
  }
}
