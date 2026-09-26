import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/api_constants.dart';
import '../../core/services/location_service.dart';
import '../../core/services/permission_service.dart';
import '../../core/widgets/animated_spring_button.dart';
import '../../shared/providers/dio_provider.dart';

class PropertyPhotoItem {
  final XFile file;
  final Uint8List bytes;

  PropertyPhotoItem({
    required this.file,
    required this.bytes,
  });
}

class AddPropertyScreen extends ConsumerStatefulWidget {
  const AddPropertyScreen({super.key});

  @override
  ConsumerState<AddPropertyScreen> createState() => _AddPropertyScreenState();
}

class _AddPropertyScreenState extends ConsumerState<AddPropertyScreen> {
  final _formKey = GlobalKey<FormState>();

  // Primary Common Controllers
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _locationController = TextEditingController();
  final _areaController = TextEditingController();
  final _addressDetailsController = TextEditingController();

  String _category = 'RESIDENTIAL_RENT';

  // --- 1. Residential Rent Specific ---
  final _rentDepositController = TextEditingController();
  final _rentAreaSqFtController = TextEditingController();
  String _rentBhk = '2 BHK';
  String _rentFurnishing = 'Semi-Furnished';
  String _rentTenantPref = 'Family / Bachelors';
  final Set<String> _rentAmenities = {'Lift', 'Covered Parking', '24/7 Security'};

  // --- 2. Residential Sale Specific ---
  final _saleCarpetAreaController = TextEditingController();
  final _saleSuperAreaController = TextEditingController();
  String _salePropertyType = 'Apartment / Flat';
  String _saleBhk = '3 BHK';
  String _salePossession = 'Ready to Move';
  String _saleOwnership = 'Freehold (A Khata)';
  String _saleNegotiable = 'Negotiable';

  // --- 3. Commercial Rent Specific ---
  final _commRentAreaController = TextEditingController();
  final _commRentLockInController = TextEditingController();
  final _commRentSeatsController = TextEditingController();
  final _commRentParkingController = TextEditingController();
  String _commRentType = 'Office Space (IT/Corporate)';
  String _commRentFurnishing = 'Fully Furnished / Plug & Play';

  // --- 4. Commercial Sale Specific ---
  final _commSaleBuiltUpController = TextEditingController();
  final _commSaleCurrentRentController = TextEditingController();
  final _commSaleRoiController = TextEditingController();
  String _commSaleType = 'Full Commercial Building';
  bool _commSaleIsPreLeased = false;

  // --- 5. Business Listing Specific ---
  final _bizRevenueController = TextEditingController();
  final _bizProfitController = TextEditingController();
  final _bizYearController = TextEditingController();
  final _bizEmployeesController = TextEditingController();
  String _bizSector = 'Food & Beverage (Cafe/Resto)';
  String _bizDealType = '100% Outright Takeover';
  final Set<String> _bizIncludedAssets = {'Interiors & Furniture', 'Equipment & Machinery', 'Active Licenses'};

  final List<PropertyPhotoItem> _selectedImages = [];
  bool _isLoading = false;
  bool _isDetectingLocation = false;
  List<Map<String, String>> _areaSuggestions = [];
  bool _isSearchingArea = false;
  final ImagePicker _picker = ImagePicker();
  final LocationService _locationService = LocationService();

  final List<Map<String, String>> _categories = [
    {'value': 'RESIDENTIAL_RENT', 'label': 'Residential Rent'},
    {'value': 'RESIDENTIAL_SALE', 'label': 'Residential Sale'},
    {'value': 'COMMERCIAL_RENT', 'label': 'Commercial Rent'},
    {'value': 'COMMERCIAL_SALE', 'label': 'Commercial Sale'},
    {'value': 'BUSINESS', 'label': 'Business Listing'},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    _areaController.dispose();
    _addressDetailsController.dispose();

    _rentDepositController.dispose();
    _rentAreaSqFtController.dispose();

    _saleCarpetAreaController.dispose();
    _saleSuperAreaController.dispose();

    _commRentAreaController.dispose();
    _commRentLockInController.dispose();
    _commRentSeatsController.dispose();
    _commRentParkingController.dispose();

    _commSaleBuiltUpController.dispose();
    _commSaleCurrentRentController.dispose();
    _commSaleRoiController.dispose();

    _bizRevenueController.dispose();
    _bizProfitController.dispose();
    _bizYearController.dispose();
    _bizEmployeesController.dispose();

    super.dispose();
  }

  Future<void> _detectLiveLocation() async {
    final hasPermission = await PermissionService.checkAndRequestLocationPermission(context);
    if (!hasPermission && mounted) return;

    setState(() => _isDetectingLocation = true);
    final details = await _locationService.fetchLiveLocationDetails();
    setState(() => _isDetectingLocation = false);

    if (details != null) {
      if (details['area'] != null && details['area']!.isNotEmpty) {
        _areaController.text = details['area']!;
      }
      if (details['address'] != null && details['address']!.isNotEmpty) {
        _addressDetailsController.text = details['address']!;
      }
      if (details['formattedAddress'] != null && details['formattedAddress']!.isNotEmpty) {
        _locationController.text = details['formattedAddress']!;
      } else if (details['city'] != null && details['city']!.isNotEmpty) {
        _locationController.text = details['city']!;
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Detected Live Location: ${details['area']}, ${details['city']}'), backgroundColor: AppColors.primaryEmerald),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Location permission denied or unavailable. Please enter location manually.'),
          backgroundColor: AppColors.statusError,
        ),
      );
    }
  }

  Future<void> _onAreaChanged(String query) async {
    if (query.trim().length < 2) {
      if (_areaSuggestions.isNotEmpty) {
        setState(() => _areaSuggestions = []);
      }
      return;
    }

    setState(() => _isSearchingArea = true);
    final results = await _locationService.searchAreaSuggestions(query);
    if (mounted) {
      setState(() {
        _areaSuggestions = results;
        _isSearchingArea = false;
      });
    }
  }

  Future<void> _pickImages() async {
    final hasPermission = await PermissionService.checkAndRequestStoragePermission(context);
    if (!hasPermission && mounted) return;

    final List<XFile> images = await _picker.pickMultiImage(
      imageQuality: 70,
      maxWidth: 1280,
      maxHeight: 1280,
    );
    if (images.isNotEmpty) {
      final List<PropertyPhotoItem> newPhotos = [];
      for (final img in images) {
        final bytes = await img.readAsBytes();
        newPhotos.add(PropertyPhotoItem(file: img, bytes: bytes));
      }
      if (mounted) {
        setState(() {
          _selectedImages.addAll(newPhotos);
        });
      }
    }
  }

  Future<void> _saveProperty(bool isDraft) async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedImages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least 1 photo for listing verification'), backgroundColor: AppColors.statusError),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dio = ref.read(dioClientProvider).dio;
      final List<String> uploadedKeys = [];

      for (final photo in _selectedImages) {
        final bytes = photo.bytes;
        final rawName = photo.file.name.trim();
        final ext = rawName.contains('.') ? rawName.split('.').last.toLowerCase() : 'jpg';
        final safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].contains(ext) ? ext : 'jpg';
        final mimeType = safeExt == 'png' ? 'image/png' : safeExt == 'webp' ? 'image/webp' : safeExt == 'avif' ? 'image/avif' : 'image/jpeg';
        final base64String = 'data:$mimeType;base64,${base64Encode(bytes)}';

        final uploadRes = await dio.post(ApiConstants.directUpload, data: {
          'bucketType': 'property-images',
          'base64Data': base64String,
          'filename': photo.file.name,
        });

        if (uploadRes.data['success'] == true) {
          final fileKey = uploadRes.data['data']['fileKey']?.toString();
          if (fileKey != null && fileKey.isNotEmpty) {
            uploadedKeys.add(fileKey);
          }
        }
      }

      if (uploadedKeys.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to upload property photos. Please verify network and try again.'),
              backgroundColor: AppColors.statusError,
            ),
          );
          setState(() => _isLoading = false);
        }
        return;
      }

      // Build category-specific specifications dictionary
      Map<String, dynamic> specifications = {};
      if (_category == 'RESIDENTIAL_RENT') {
        specifications = {
          'bhk': _rentBhk,
          'furnishing': _rentFurnishing,
          'deposit': _rentDepositController.text.trim(),
          'areaSqFt': _rentAreaSqFtController.text.trim(),
          'tenantPreference': _rentTenantPref,
          'amenities': _rentAmenities.toList(),
        };
      } else if (_category == 'RESIDENTIAL_SALE') {
        specifications = {
          'propertyType': _salePropertyType,
          'bhk': _saleBhk,
          'possession': _salePossession,
          'carpetAreaSqFt': _saleCarpetAreaController.text.trim(),
          'superAreaSqFt': _saleSuperAreaController.text.trim(),
          'ownership': _saleOwnership,
          'negotiable': _saleNegotiable,
        };
      } else if (_category == 'COMMERCIAL_RENT') {
        specifications = {
          'commercialType': _commRentType,
          'furnishing': _commRentFurnishing,
          'areaSqFt': _commRentAreaController.text.trim(),
          'lockInPeriod': _commRentLockInController.text.trim(),
          'seats': _commRentSeatsController.text.trim(),
          'parking': _commRentParkingController.text.trim(),
        };
      } else if (_category == 'COMMERCIAL_SALE') {
        specifications = {
          'commercialType': _commSaleType,
          'builtUpSqFt': _commSaleBuiltUpController.text.trim(),
          'isPreLeased': _commSaleIsPreLeased,
          'currentMonthlyRent': _commSaleCurrentRentController.text.trim(),
          'expectedRoi': _commSaleRoiController.text.trim(),
        };
      } else if (_category == 'BUSINESS') {
        specifications = {
          'sector': _bizSector,
          'dealType': _bizDealType,
          'monthlyRevenue': _bizRevenueController.text.trim(),
          'monthlyProfit': _bizProfitController.text.trim(),
          'establishedYear': _bizYearController.text.trim(),
          'employees': _bizEmployeesController.text.trim(),
          'includedAssets': _bizIncludedAssets.toList(),
        };
      }

      final response = await dio.post(ApiConstants.createProperty, data: {
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'price': double.parse(_priceController.text.trim()),
        'category': _category,
        'area': _areaController.text.trim(),
        'addressDetails': _addressDetailsController.text.trim(),
        'specifications': specifications,
        'location': _locationController.text.trim(),
        'imageKeys': uploadedKeys,
        'isDraft': isDraft,
      });

      if (response.data['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isDraft ? 'Listing draft saved successfully' : 'Property submitted for administrative review!'),
            backgroundColor: AppColors.primaryEmerald,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Submission failed. Please verify fields and network.';
        if (e is DioException && e.response?.data != null) {
          final resData = e.response!.data;
          if (resData is Map && resData['message'] != null) {
            if (resData['message'] is List) {
              errorMessage = (resData['message'] as List).join(', ');
            } else {
              errorMessage = resData['message'].toString();
            }
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage), backgroundColor: AppColors.statusError),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryBg,
      appBar: AppBar(
        title: Text(
          'Add Property Listing',
          style: GoogleFonts.plusJakartaSans(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: AppColors.charcoal,
          ),
        ),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Header Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Listing Details',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.charcoal,
                        letterSpacing: -0.3,
                      ),
                    ),
                    _buildCategoryBadge(),
                  ],
                ),
                const SizedBox(height: 16),

                // 1. Primary Category Selector
                DropdownButtonFormField<String>(
                  isExpanded: true,
                  value: _category,
                  decoration: const InputDecoration(
                    labelText: 'Listing Category *',
                    prefixIcon: Icon(Icons.category_rounded, color: AppColors.primaryEmerald),
                  ),
                  items: _categories
                      .map(
                        (c) => DropdownMenuItem(
                          value: c['value'],
                          child: Text(
                            c['label']!,
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _category = val;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),

                // 2. Title & Dynamic Price
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    labelText: _getTitleLabel(),
                    hintText: _getTitleHint(),
                    prefixIcon: const Icon(Icons.title_rounded),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Please enter listing title' : null,
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _priceController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: _getPriceLabel(),
                    hintText: _getPriceHint(),
                    prefixIcon: const Icon(Icons.currency_rupee_rounded),
                  ),
                  validator: (val) => val == null || double.tryParse(val) == null ? 'Enter valid numeric amount' : null,
                ),
                const SizedBox(height: 20),

                // 3. Dynamic Category Specific Fields
                _buildCategorySpecificFields(),
                const SizedBox(height: 20),

                // 4. Location & Address Details (Mandatory Fields)
                TextFormField(
                  controller: _areaController,
                  onChanged: _onAreaChanged,
                  decoration: InputDecoration(
                    labelText: 'Area / Locality * (Mandatory)',
                    hintText: 'e.g. SVN Colony, Madhapur, Jubilee Hills',
                    prefixIcon: const Icon(Icons.explore_rounded, color: AppColors.primaryEmerald),
                    suffixIcon: _isSearchingArea
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                          )
                        : null,
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Area / Locality is a mandatory field' : null,
                ),
                if (_areaSuggestions.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    maxHeight: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: _areaSuggestions.length,
                      itemBuilder: (context, index) {
                        final sug = _areaSuggestions[index];
                        return ListTile(
                          dense: true,
                          leading: const Icon(Icons.location_on_outlined, color: AppColors.primaryEmerald, size: 20),
                          title: Text(sug['area'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          subtitle: Text(sug['address'] ?? '', style: const TextStyle(fontSize: 11, color: AppColors.textMedium), maxLines: 1, overflow: TextOverflow.ellipsis),
                          onTap: () {
                            setState(() {
                              _areaController.text = sug['area'] ?? '';
                              if (sug['address'] != null && sug['address']!.isNotEmpty) {
                                _addressDetailsController.text = sug['address']!;
                              }
                              if (sug['city'] != null && sug['city']!.isNotEmpty) {
                                _locationController.text = '${sug['area']}, ${sug['city']}';
                              } else {
                                _locationController.text = sug['address'] ?? sug['area'] ?? '';
                              }
                              _areaSuggestions = [];
                            });
                          },
                        );
                      },
                    ),
                  ),
                ],
                const SizedBox(height: 16),

                TextFormField(
                  controller: _addressDetailsController,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Full Address Details * (Mandatory)',
                    hintText: 'e.g. Door No. 4-12, Street 3, Near Water Tank',
                    prefixIcon: Icon(Icons.home_work_rounded, color: AppColors.primaryEmerald),
                    alignLabelWithHint: true,
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Full Address Details are mandatory' : null,
                ),
                const SizedBox(height: 16),

                TextFormField(
                  controller: _locationController,
                  decoration: InputDecoration(
                    labelText: 'City / Region *',
                    hintText: 'e.g. Guntur, Andhra Pradesh',
                    prefixIcon: const Icon(Icons.location_city_rounded, color: AppColors.primaryEmerald),
                    suffixIcon: _isDetectingLocation
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                          )
                        : IconButton(
                            icon: const Icon(Icons.my_location_rounded, color: AppColors.primaryEmerald),
                            tooltip: 'Detect Live GPS Location',
                            onPressed: _detectLiveLocation,
                          ),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'City / Region is a mandatory field' : null,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Type city/region or tap live GPS button to auto-detect area and address',
                        style: TextStyle(fontSize: 11, color: AppColors.textMedium),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: _isDetectingLocation ? null : _detectLiveLocation,
                      child: const Row(
                        mainAxisSize: MinAxisSize.min,
                        children: [
                          Icon(Icons.my_location_rounded, size: 13, color: AppColors.primaryEmerald),
                          SizedBox(width: 4),
                          Text(
                            'Live GPS Auto-Detect',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryEmeraldDark),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // 5. Description
                TextFormField(
                  controller: _descController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    labelText: _getDescriptionLabel(),
                    hintText: _getDescriptionHint(),
                    alignLabelWithHint: true,
                  ),
                  validator: (val) => val == null || val.trim().length < 10 ? 'Please enter at least 10 characters description' : null,
                ),
                const SizedBox(height: 24),

                // 6. Property Photos Upload
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text('Listing Photos *', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark)),
                        if (_selectedImages.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.emeraldSurface,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.primaryEmerald.withOpacity(0.3)),
                            ),
                            child: Text(
                              '${_selectedImages.length} Added',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryEmeraldDark),
                            ),
                          ),
                        ],
                      ],
                    ),
                    TextButton.icon(
                      onPressed: _pickImages,
                      icon: const Icon(Icons.add_a_photo_rounded, size: 18, color: AppColors.primaryEmerald),
                      label: const Text('Add Photos', style: TextStyle(color: AppColors.primaryEmerald, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                _selectedImages.isEmpty
                    ? Container(
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.inputFillSubtle,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.borderLight, style: BorderStyle.solid),
                        ),
                        child: InkWell(
                          onTap: _pickImages,
                          borderRadius: BorderRadius.circular(16),
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_photo_alternate_outlined, color: AppColors.primaryEmerald, size: 36),
                                SizedBox(height: 8),
                                Text('Tap to choose property or business photos', style: TextStyle(color: AppColors.textDark, fontSize: 13, fontWeight: FontWeight.w600)),
                                SizedBox(height: 4),
                                Text('Supports any photo size, ratio & format', style: TextStyle(color: AppColors.textLight, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                      )
                    : SizedBox(
                        height: 120,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          physics: const BouncingScrollPhysics(),
                          itemCount: _selectedImages.length,
                          itemBuilder: (context, index) {
                            final item = _selectedImages[index];
                            return Stack(
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(right: 12),
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: AppColors.borderLight, width: 1.5),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.04),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Image.memory(
                                      item.bytes,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) => Container(
                                        color: Colors.grey.shade200,
                                        child: const Icon(Icons.broken_image_rounded, color: Colors.grey),
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 6,
                                  right: 18,
                                  child: GestureDetector(
                                    onTap: () => setState(() => _selectedImages.removeAt(index)),
                                    child: Container(
                                      padding: const EdgeInsets.all(4),
                                      decoration: const BoxDecoration(
                                        color: Colors.black54,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.close_rounded, size: 14, color: Colors.white),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                const SizedBox(height: 32),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _isLoading ? null : () => _saveProperty(true),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 52),
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                          side: const BorderSide(color: AppColors.subtleBorder),
                        ),
                        child: Center(
                          child: Text(
                            'Save Draft',
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: AppColors.charcoal,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: AnimatedSpringButton(
                        text: 'Submit for Review',
                        icon: null,
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        isLoading: _isLoading,
                        onPressed: _isLoading ? null : () => _saveProperty(false),
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: AppColors.charcoal,
                        textColor: Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Dynamic Badges & Label Helpers
  Widget _buildCategoryBadge() {
    String text = 'Residential';
    Color color = AppColors.primaryEmerald;
    Color bg = AppColors.emeraldSurface;

    if (_category == 'RESIDENTIAL_RENT') {
      text = 'Rental Flat';
      color = const Color(0xFF059669);
      bg = const Color(0xFFECFDF5);
    } else if (_category == 'RESIDENTIAL_SALE') {
      text = 'For Sale';
      color = const Color(0xFF2563EB);
      bg = const Color(0xFFEFF6FF);
    } else if (_category == 'COMMERCIAL_RENT') {
      text = 'Commercial Lease';
      color = const Color(0xFFD97706);
      bg = const Color(0xFFFFFBEB);
    } else if (_category == 'COMMERCIAL_SALE') {
      text = 'Commercial Asset';
      color = const Color(0xFF7C3AED);
      bg = const Color(0xFFF5F3FF);
    } else if (_category == 'BUSINESS') {
      text = 'Business Takeover';
      color = const Color(0xFFE11D48);
      bg = const Color(0xFFFFF1F2);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withAlpha(60))),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color)),
    );
  }

  String _getTitleLabel() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return 'Property Title *';
      case 'RESIDENTIAL_SALE':
        return 'Property Title *';
      case 'COMMERCIAL_RENT':
        return 'Commercial Space Title *';
      case 'COMMERCIAL_SALE':
        return 'Commercial Asset Title *';
      case 'BUSINESS':
        return 'Business / Enterprise Name *';
      default:
        return 'Title *';
    }
  }

  String _getTitleHint() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return 'e.g. 3 BHK Semi-Furnished Flat in Indiranagar';
      case 'RESIDENTIAL_SALE':
        return 'e.g. 4 BHK Luxury Gated Villa in Whitefield';
      case 'COMMERCIAL_RENT':
        return 'e.g. 2,500 sq.ft Fully Furnished IT Office Space';
      case 'COMMERCIAL_SALE':
        return 'e.g. Grade-A Commercial Showroom / Office Building';
      case 'BUSINESS':
        return 'e.g. Operational Italian Cafe & Bistro with Bar License';
      default:
        return 'Enter title';
    }
  }

  String _getPriceLabel() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return 'Monthly Rent (₹) *';
      case 'RESIDENTIAL_SALE':
        return 'Total Expected Selling Price (₹) *';
      case 'COMMERCIAL_RENT':
        return 'Monthly Rent (₹) *';
      case 'COMMERCIAL_SALE':
        return 'Total Asking Price (₹) *';
      case 'BUSINESS':
        return 'Asking Price / Valuation (₹) *';
      default:
        return 'Price (₹) *';
    }
  }

  String _getPriceHint() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return 'e.g. 35000';
      case 'RESIDENTIAL_SALE':
        return 'e.g. 8500000';
      case 'COMMERCIAL_RENT':
        return 'e.g. 120000';
      case 'COMMERCIAL_SALE':
        return 'e.g. 45000000';
      case 'BUSINESS':
        return 'e.g. 1800000';
      default:
        return 'e.g. 50000';
    }
  }

  String _getDescriptionLabel() {
    switch (_category) {
      case 'BUSINESS':
        return 'Business Overview & Included Assets *';
      default:
        return 'Description & Details *';
    }
  }

  String _getDescriptionHint() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return 'Details about floor, facing, power backup, nearby metro/schools, move-in terms...';
      case 'RESIDENTIAL_SALE':
        return 'Details regarding carpet area, legal approvals, loan availability, community highlights...';
      case 'COMMERCIAL_RENT':
        return 'Details regarding workstation layout, cabins, conference halls, cafeteria, generator backup...';
      case 'COMMERCIAL_SALE':
        return 'Details about rental yields, tenant profile, construction quality, ROI potential...';
      case 'BUSINESS':
        return 'Describe daily operations, reason for sale, inventory, machine models, licenses, customer base...';
      default:
        return 'Provide complete details...';
    }
  }

  // --- Dynamic Category Form Fields Builder ---
  Widget _buildCategorySpecificFields() {
    switch (_category) {
      case 'RESIDENTIAL_RENT':
        return _buildResidentialRentFields();
      case 'RESIDENTIAL_SALE':
        return _buildResidentialSaleFields();
      case 'COMMERCIAL_RENT':
        return _buildCommercialRentFields();
      case 'COMMERCIAL_SALE':
        return _buildCommercialSaleFields();
      case 'BUSINESS':
        return _buildBusinessFields();
      default:
        return const SizedBox.shrink();
    }
  }

  // 1. Residential Rent Specific
  Widget _buildResidentialRentFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Rental & Configuration Details'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _rentDepositController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Security Deposit (₹)', hintText: 'e.g. 150000'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _rentAreaSqFtController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Super Area (sq.ft)', hintText: 'e.g. 1450'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _rentBhk,
                decoration: const InputDecoration(labelText: 'BHK Type'),
                items: ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Villa / House']
                    .map((b) => DropdownMenuItem(value: b, child: Text(b, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _rentBhk = val!),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _rentFurnishing,
                decoration: const InputDecoration(labelText: 'Furnishing'),
                items: ['Semi-Furnished', 'Fully Furnished', 'Unfurnished']
                    .map((f) => DropdownMenuItem(value: f, child: Text(f, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _rentFurnishing = val!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _rentTenantPref,
          decoration: const InputDecoration(labelText: 'Preferred Tenants', prefixIcon: Icon(Icons.people_outline_rounded)),
          items: ['Family / Bachelors', 'Family Only', 'Bachelors Only', 'Company Lease']
              .map((t) => DropdownMenuItem(value: t, child: Text(t, overflow: TextOverflow.ellipsis)))
              .toList(),
          onChanged: (val) => setState(() => _rentTenantPref = val!),
        ),
        const SizedBox(height: 16),
        const Text('Key Amenities', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textDark)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ['Lift', 'Covered Parking', '24/7 Security', 'Power Backup', 'Gym', 'Swimming Pool', 'Gated Society'].map((amenity) {
            final isSelected = _rentAmenities.contains(amenity);
            return FilterChip(
              label: Text(amenity, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500, color: isSelected ? AppColors.primaryEmeraldDark : AppColors.textDark)),
              selected: isSelected,
              backgroundColor: Colors.white,
              selectedColor: AppColors.emeraldSurface,
              side: BorderSide(color: isSelected ? AppColors.primaryEmerald : AppColors.borderLight),
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _rentAmenities.add(amenity);
                  } else {
                    _rentAmenities.remove(amenity);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  // 2. Residential Sale Specific
  Widget _buildResidentialSaleFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Property Specifications & Ownership'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _salePropertyType,
                decoration: const InputDecoration(labelText: 'Property Type'),
                items: ['Apartment / Flat', 'Independent Villa / House', 'Residential Plot / Land', 'Penthouse']
                    .map((t) => DropdownMenuItem(value: t, child: Text(t, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _salePropertyType = val!),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _saleBhk,
                decoration: const InputDecoration(labelText: 'BHK / Config'),
                items: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'N/A (Plot)']
                    .map((b) => DropdownMenuItem(value: b, child: Text(b, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _saleBhk = val!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _saleCarpetAreaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Carpet Area (sq.ft)', hintText: 'e.g. 1200'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _saleSuperAreaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Super Area (sq.ft)', hintText: 'e.g. 1650'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _salePossession,
                decoration: const InputDecoration(labelText: 'Possession Status'),
                items: ['Ready to Move', 'Under Construction', 'Resale / Immediate']
                    .map((p) => DropdownMenuItem(value: p, child: Text(p, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _salePossession = val!),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _saleNegotiable,
                decoration: const InputDecoration(labelText: 'Price Flexibility'),
                items: ['Negotiable', 'Fixed Price', 'Slightly Negotiable']
                    .map((n) => DropdownMenuItem(value: n, child: Text(n, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _saleNegotiable = val!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _saleOwnership,
          decoration: const InputDecoration(labelText: 'Ownership & Legal Khata', prefixIcon: Icon(Icons.verified_outlined)),
          items: ['Freehold (A Khata)', 'B Khata', 'E-Khata', 'Society / DC Converted']
              .map((o) => DropdownMenuItem(value: o, child: Text(o, overflow: TextOverflow.ellipsis)))
              .toList(),
          onChanged: (val) => setState(() => _saleOwnership = val!),
        ),
      ],
    );
  }

  // 3. Commercial Rent Specific
  Widget _buildCommercialRentFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Commercial Space Details'),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _commRentType,
          decoration: const InputDecoration(labelText: 'Commercial Space Type', prefixIcon: Icon(Icons.business_center_rounded)),
          items: ['Office Space (IT/Corporate)', 'Retail Shop / Showroom', 'Warehouse / Industrial Godown', 'Co-Working Space', 'Restaurant / Food Court']
              .map((t) => DropdownMenuItem(value: t, child: Text(t, overflow: TextOverflow.ellipsis)))
              .toList(),
          onChanged: (val) => setState(() => _commRentType = val!),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _commRentAreaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Super Area (sq.ft) *', hintText: 'e.g. 2500'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<String>(
                isExpanded: true,
                value: _commRentFurnishing,
                decoration: const InputDecoration(labelText: 'Fit-out State'),
                items: ['Fully Furnished / Plug & Play', 'Warm Shell', 'Bare Shell']
                    .map((f) => DropdownMenuItem(value: f, child: Text(f, overflow: TextOverflow.ellipsis)))
                    .toList(),
                onChanged: (val) => setState(() => _commRentFurnishing = val!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _commRentSeatsController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Workstations / Seats', hintText: 'e.g. 35 Seats'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _commRentLockInController,
                decoration: const InputDecoration(labelText: 'Lock-in Period', hintText: 'e.g. 3 Years'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // 4. Commercial Sale Specific
  Widget _buildCommercialSaleFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Commercial Investment & Yield'),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _commSaleType,
          decoration: const InputDecoration(labelText: 'Commercial Asset Type', prefixIcon: Icon(Icons.apartment_rounded)),
          items: ['Full Commercial Building', 'Commercial Office Unit', 'Retail Shop / Showroom', 'Commercial Plot / Land', 'Industrial Warehouse']
              .map((t) => DropdownMenuItem(value: t, child: Text(t, overflow: TextOverflow.ellipsis)))
              .toList(),
          onChanged: (val) => setState(() => _commSaleType = val!),
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _commSaleBuiltUpController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Total Built-up Area (sq.ft) *', hintText: 'e.g. 12000'),
        ),
        const SizedBox(height: 14),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Is this property currently Pre-Leased?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          subtitle: const Text('Pre-leased commercial properties offer immediate rental yield', style: TextStyle(fontSize: 11, color: AppColors.textMedium)),
          value: _commSaleIsPreLeased,
          activeColor: AppColors.primaryEmerald,
          onChanged: (val) => setState(() => _commSaleIsPreLeased = val),
        ),
        if (_commSaleIsPreLeased) ...[
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: _commSaleCurrentRentController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Monthly Rent Inflow (₹)', hintText: 'e.g. 180000'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextFormField(
                  controller: _commSaleRoiController,
                  decoration: const InputDecoration(labelText: 'Expected ROI Yield (%)', hintText: 'e.g. 8.2%'),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  // 5. Business Listing Specific
  Widget _buildBusinessFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Business Financials & Takeover Terms'),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _bizSector,
          decoration: const InputDecoration(labelText: 'Industry Sector *', prefixIcon: Icon(Icons.storefront_rounded)),
          items: [
            'Food & Beverage (Cafe/Resto)',
            'Retail & Supermarket',
            'Gym & Fitness Centre',
            'Salon, Spa & Wellness',
            'Pharmacy & Healthcare',
            'Automobile & Garage',
            'Education & Coaching',
            'Other Business'
          ].map((s) => DropdownMenuItem(value: s, child: Text(s, overflow: TextOverflow.ellipsis))).toList(),
          onChanged: (val) => setState(() => _bizSector = val!),
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _bizDealType,
          decoration: const InputDecoration(labelText: 'Transfer / Deal Type', prefixIcon: Icon(Icons.handshake_outlined)),
          items: ['100% Outright Takeover', 'Franchise Transfer', '50% Partnership / Equity', 'Asset / Machine Sale']
              .map((d) => DropdownMenuItem(value: d, child: Text(d, overflow: TextOverflow.ellipsis)))
              .toList(),
          onChanged: (val) => setState(() => _bizDealType = val!),
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _bizRevenueController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Monthly Revenue (₹)', hintText: 'e.g. 450000'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _bizProfitController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Monthly Net Profit (₹)', hintText: 'e.g. 120000'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: TextFormField(
                controller: _bizYearController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Established Year', hintText: 'e.g. 2021'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextFormField(
                controller: _bizEmployeesController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Staff Count', hintText: 'e.g. 6 Employees'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        const Text('Included in Buyout Deal', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textDark)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ['Interiors & Furniture', 'Equipment & Machinery', 'Active Licenses', 'Inventory Stock', 'Brand & Goodwill'].map((asset) {
            final isSelected = _bizIncludedAssets.contains(asset);
            return FilterChip(
              label: Text(asset, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500, color: isSelected ? AppColors.primaryEmeraldDark : AppColors.textDark)),
              selected: isSelected,
              backgroundColor: Colors.white,
              selectedColor: AppColors.emeraldSurface,
              side: BorderSide(color: isSelected ? AppColors.primaryEmerald : AppColors.borderLight),
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _bizIncludedAssets.add(asset);
                  } else {
                    _bizIncludedAssets.remove(asset);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.inputFillSubtle,
        borderRadius: BorderRadius.circular(8),
        border: const Border(left: BorderSide(color: AppColors.primaryEmerald, width: 3)),
      ),
      child: Text(
        title,
        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textDark),
      ),
    );
  }
}
