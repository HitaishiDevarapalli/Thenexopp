import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/location_service.dart';
import '../../core/services/permission_service.dart';
import '../../shared/providers/dio_provider.dart';
import '../../shared/providers/auth_provider.dart';

class ProfileOnboardingScreen extends ConsumerStatefulWidget {
  const ProfileOnboardingScreen({super.key});

  @override
  ConsumerState<ProfileOnboardingScreen> createState() => _ProfileOnboardingScreenState();
}

class _ProfileOnboardingScreenState extends ConsumerState<ProfileOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _areaController = TextEditingController();
  final _ageController = TextEditingController();
  final _workController = TextEditingController();

  String _gender = 'Male';
  XFile? _profilePhotoFile;
  Uint8List? _profilePhotoBytes;
  bool _isLoading = false;
  bool _isDetectingLocation = false;
  final ImagePicker _picker = ImagePicker();
  final LocationService _locationService = LocationService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      PermissionService.requestAllAppPermissions(context);
    });
  }

  Future<void> _pickProfilePhoto() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Upload Profile Photo / Selfie',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textDark),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              const Text(
                'Please select a clear photo of your face for agent identity verification.',
                style: TextStyle(fontSize: 13, color: AppColors.textMedium),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        final hasPerm = await PermissionService.checkAndRequestCameraPermission(context);
                        if (!hasPerm && mounted) return;
                        final XFile? photo = await _picker.pickImage(source: ImageSource.camera, preferredCameraDevice: CameraDevice.front, imageQuality: 80);
                        if (photo != null && mounted) {
                          final bytes = await photo.readAsBytes();
                          setState(() {
                            _profilePhotoFile = photo;
                            _profilePhotoBytes = bytes;
                          });
                        }
                      },
                      icon: const Icon(Icons.camera_alt_rounded, color: AppColors.primaryEmerald),
                      label: const Text('Take Selfie', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () async {
                        Navigator.pop(ctx);
                        final hasPerm = await PermissionService.checkAndRequestStoragePermission(context);
                        if (!hasPerm && mounted) return;
                        final XFile? photo = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
                        if (photo != null && mounted) {
                          final bytes = await photo.readAsBytes();
                          setState(() {
                            _profilePhotoFile = photo;
                            _profilePhotoBytes = bytes;
                          });
                        }
                      },
                      icon: const Icon(Icons.photo_library_rounded, color: AppColors.primaryEmerald),
                      label: const Text('From Gallery', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<String?> _uploadPhoto(XFile file) async {
    try {
      final dio = ref.read(dioClientProvider).dio;
      final bytes = await file.readAsBytes();
      final rawName = file.name.trim();
      final ext = rawName.contains('.') ? rawName.split('.').last.toLowerCase() : 'jpg';
      final safeExt = ['jpg', 'jpeg', 'png', 'webp'].contains(ext) ? ext : 'jpg';
      final mimeType = safeExt == 'png' ? 'image/png' : safeExt == 'webp' ? 'image/webp' : 'image/jpeg';
      final base64String = 'data:$mimeType;base64,${base64Encode(bytes)}';

      final res = await dio.post(ApiConstants.directUpload, data: {
        'bucketType': 'private-kyc',
        'base64Data': base64String,
        'filename': file.name,
      });

      if (res.data['success'] == true) {
        return res.data['data']['fileKey']?.toString();
      }
    } catch (e) {
      debugPrint('Presigned URL error: $e');
    }
    return null;
  }

  Future<void> _detectLiveLocation() async {
    setState(() => _isDetectingLocation = true);
    final loc = await _locationService.fetchLiveOpenStreetMapLocation();
    setState(() => _isDetectingLocation = false);

    if (loc != null && loc.isNotEmpty) {
      _areaController.text = loc;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Detected OSM Location: $loc'), backgroundColor: AppColors.primaryEmerald),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location permission denied or unavailable. Please enter area manually.'),
          backgroundColor: AppColors.statusError,
        ),
      );
    }
  }

  Future<void> _submitProfile() async {
    if (!_formKey.currentState!.validate()) return;
    if (_profilePhotoBytes == null && _profilePhotoFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please take a selfie or upload your profile photo to continue.'),
          backgroundColor: AppColors.statusError,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(dioClientProvider).dio;
      String? photoKey;
      if (_profilePhotoFile != null) {
        photoKey = await _uploadPhoto(_profilePhotoFile!);
      }
      if (photoKey == null && _profilePhotoBytes != null) {
        photoKey = 'data:image/jpeg;base64,${base64Encode(_profilePhotoBytes!)}';
      }
      photoKey ??= 'kyc-profile-${DateTime.now().millisecondsSinceEpoch}.jpg';

      final work = _workController.text.trim();
      final ageVal = int.tryParse(_ageController.text.trim()) ?? 25;
      final payload = <String, dynamic>{
        'fullName': _nameController.text.trim(),
        'areaLocation': _areaController.text.trim(),
        'age': ageVal,
        'gender': _gender,
        'workPlatform': work.isNotEmpty ? work : 'Human Agent / Partner',
        'profilePhotoUrl': photoKey,
      };

      final response = await dio.put(ApiConstants.updateProfile, data: payload);

      if (response.statusCode == 200 || response.data?['success'] == true) {
        if (mounted) {
          ref.read(authProvider.notifier).updateAgentState('KYC_INCOMPLETE');
        }
      } else {
        final msg = response.data?['message']?.toString() ?? 'Failed to save profile details.';
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(msg), backgroundColor: AppColors.statusError),
          );
        }
      }
    } catch (e) {
      debugPrint('[ProfileOnboarding] Error: $e');
      String errorMsg = 'Failed to submit profile. Please verify your details.';
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
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Agent Profile (Step 1 of 3)')),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const LinearProgressIndicator(value: 0.33, backgroundColor: AppColors.borderLight, color: AppColors.primaryEmerald),
                const SizedBox(height: 24),
                const Text('Personal & Work Details', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textDark, letterSpacing: -0.4)),
                const SizedBox(height: 6),
                const Text('Upload your clear face photo and enter details to register your agent account.', style: TextStyle(fontSize: 13, color: AppColors.textMedium)),
                const SizedBox(height: 24),

                // Agent Photo Picker
                Center(
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: _pickProfilePhoto,
                        child: Container(
                          width: 104,
                          height: 104,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.emeraldSurface,
                            border: Border.all(color: AppColors.emeraldBorder, width: 2),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withAlpha(8), blurRadius: 16, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: ClipOval(
                            child: _profilePhotoBytes != null
                                ? Image.memory(
                                    _profilePhotoBytes!,
                                    width: 104,
                                    height: 104,
                                    fit: BoxFit.cover,
                                  )
                                : const Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.person_add_alt_1_rounded, size: 36, color: AppColors.primaryEmerald),
                                      SizedBox(height: 4),
                                      Text('Add Photo', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.primaryEmeraldDark)),
                                    ],
                                  ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: GestureDetector(
                          onTap: _pickProfilePhoto,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.primaryEmerald,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 6),
                              ],
                            ),
                            child: const Icon(Icons.camera_alt_rounded, size: 16, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Center(
                  child: Text(
                    _profilePhotoFile != null ? 'Photo Selected (Tap to Change)' : 'Take Selfie or Upload Photo *',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: _profilePhotoFile != null ? AppColors.primaryEmerald : AppColors.textLight,
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_rounded)),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Enter full name' : null,
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _areaController,
                  decoration: InputDecoration(
                    labelText: 'Area / Operating Location',
                    prefixIcon: const Icon(Icons.location_on_rounded),
                    suffixIcon: _isDetectingLocation
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                          )
                        : IconButton(
                            icon: const Icon(Icons.my_location_rounded, color: AppColors.primaryEmerald),
                            tooltip: 'Use Live OpenStreetMap Location',
                            onPressed: _detectLiveLocation,
                          ),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Enter operating location or use live GPS' : null,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Type location or use live GPS',
                        style: TextStyle(fontSize: 11, color: AppColors.textMedium),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: _isDetectingLocation ? null : _detectLiveLocation,
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.my_location_rounded, size: 13, color: AppColors.primaryEmerald),
                          SizedBox(width: 4),
                          Text(
                            'Live OpenStreetMap',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryEmeraldDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _ageController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Age', prefixIcon: Icon(Icons.cake_rounded)),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Enter age';
                    final age = int.tryParse(val);
                    if (age == null || age < 18 || age > 80) return 'Age must be between 18 and 80';
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                DropdownButtonFormField<String>(
                  isExpanded: true,
                  initialValue: _gender,
                  decoration: const InputDecoration(labelText: 'Gender', prefixIcon: Icon(Icons.wc_rounded)),
                  items: ['Male', 'Female', 'Other']
                      .map((g) => DropdownMenuItem(value: g, child: Text(g, overflow: TextOverflow.ellipsis, maxLines: 1)))
                      .toList(),
                  onChanged: (val) => setState(() => _gender = val!),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _workController,
                  decoration: const InputDecoration(
                    labelText: 'Current Work / Occupation (Optional)',
                    hintText: 'e.g. Real Estate Agent, Delivery, Business, Freelancer',
                    prefixIcon: Icon(Icons.work_outline_rounded),
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _isLoading ? null : _submitProfile,
                  child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)) : const Text('Continue to KYC'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
