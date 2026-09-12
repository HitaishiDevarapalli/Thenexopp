import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    webOptions: WebOptions(dbName: 'thenexopp_agent_db', publicKey: 'thenexopp_key'),
  );

  static const String _keyAccessToken = 'tnx_access_token';
  static const String _keyRefreshToken = 'tnx_refresh_token';
  static const String _keyAgentState = 'tnx_agent_state';
  static const String _keyUserId = 'tnx_user_id';
  static const String _keyAgentId = 'tnx_agent_id';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required String agentState,
    required String userId,
    String? agentId,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAccessToken, accessToken);
      await prefs.setString(_keyRefreshToken, refreshToken);
      await prefs.setString(_keyAgentState, agentState);
      await prefs.setString(_keyUserId, userId);
      if (agentId != null) {
        await prefs.setString(_keyAgentId, agentId);
      }
    } catch (e) {
      debugPrint('[SecureStorageService] SharedPreferences write error: $e');
    }

    if (!kIsWeb) {
      try {
        await _storage.write(key: _keyAccessToken, value: accessToken);
        await _storage.write(key: _keyRefreshToken, value: refreshToken);
        await _storage.write(key: _keyAgentState, value: agentState);
        await _storage.write(key: _keyUserId, value: userId);
        if (agentId != null) {
          await _storage.write(key: _keyAgentId, value: agentId);
        }
      } catch (e) {
        debugPrint('[SecureStorageService] SecureStorage write error: $e');
      }
    }
  }

  Future<String?> getAccessToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString(_keyAccessToken);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}

    if (!kIsWeb) {
      try {
        return await _storage.read(key: _keyAccessToken);
      } catch (_) {}
    }
    return null;
  }

  Future<String?> getRefreshToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString(_keyRefreshToken);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}

    if (!kIsWeb) {
      try {
        return await _storage.read(key: _keyRefreshToken);
      } catch (_) {}
    }
    return null;
  }

  Future<String?> getAgentState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString(_keyAgentState);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}

    if (!kIsWeb) {
      try {
        return await _storage.read(key: _keyAgentState);
      } catch (_) {}
    }
    return null;
  }

  Future<String?> getUserId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString(_keyUserId);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}

    if (!kIsWeb) {
      try {
        return await _storage.read(key: _keyUserId);
      } catch (_) {}
    }
    return null;
  }

  Future<String?> getAgentId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final val = prefs.getString(_keyAgentId);
      if (val != null && val.isNotEmpty) return val;
    } catch (_) {}

    if (!kIsWeb) {
      try {
        return await _storage.read(key: _keyAgentId);
      } catch (_) {}
    }
    return null;
  }

  Future<void> updateAgentState(String newState) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_keyAgentState, newState);
    } catch (_) {}

    if (!kIsWeb) {
      try {
        await _storage.write(key: _keyAgentState, value: newState);
      } catch (_) {}
    }
  }

  Future<void> clearAll() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (_) {}

    if (!kIsWeb) {
      try {
        await _storage.deleteAll();
      } catch (_) {}
    }
  }
}
