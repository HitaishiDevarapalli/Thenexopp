import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../core/constants/api_constants.dart';
import 'dio_provider.dart';
import 'auth_provider.dart';

final wsConnectedProvider = StateProvider<bool>((ref) => false);
final wsEventStreamProvider = StreamProvider<Map<String, dynamic>>((ref) {
  final service = ref.watch(webSocketProvider);
  return service.events;
});

class WebSocketService {
  io.Socket? _socket;
  final Ref _ref;
  final _eventController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get events => _eventController.stream;
  bool get isConnected => _socket?.connected ?? false;

  WebSocketService(this._ref);

  Future<void> connect() async {
    final storage = _ref.read(secureStorageProvider);
    final token = await storage.getAccessToken();
    if (token == null || token.isEmpty) return;

    if (_socket != null && _socket!.connected) return;

    try {
      final wsUrl = ApiConstants.webSocketUrl;
      debugPrint('[Socket.io] Connecting to $wsUrl with JWT Auth');

      _socket = io.io(
        wsUrl,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .enableAutoConnect()
            .enableReconnection()
            .setReconnectionDelay(1000)
            .setReconnectionAttempts(10)
            .setAuth({'token': token})
            .setQuery({'token': token})
            .build(),
      );

      _socket?.onConnect((_) {
        debugPrint('[Socket.io] ✅ Connected to server namespace /ws');
        _ref.read(wsConnectedProvider.notifier).state = true;
      });

      _socket?.on('agent.status.updated', (data) async {
        debugPrint('[Socket.io] 📢 Received agent.status.updated: $data');
        if (data != null && data['status'] != null) {
          final status = data['status'].toString();
          final reason = data['rejectionReason']?.toString();
          final incomingAgentId = data['agentId']?.toString();
          final currentAgentId = await storage.getAgentId();

          if (incomingAgentId == null || currentAgentId == null || incomingAgentId == currentAgentId) {
            _ref.read(authProvider.notifier).updateAgentState(status, rejectionReason: reason);
          }
        }
        _eventController.add({'event': 'agent.status.updated', 'data': data});
      });

      _socket?.on('kyc.status.updated', (data) async {
        debugPrint('[Socket.io] 📢 Received kyc.status.updated: $data');
        if (data != null && data['status'] != null) {
          final status = data['status'].toString();
          final reason = data['rejectionReason']?.toString();
          if (status == 'APPROVED') {
            _ref.read(authProvider.notifier).updateAgentState('APPROVED');
          } else if (status == 'REJECTED') {
            _ref.read(authProvider.notifier).updateAgentState('REJECTED', rejectionReason: reason);
          }
        }
        _eventController.add({'event': 'kyc.status.updated', 'data': data});
      });

      _socket?.on('payment.created', (data) {
        debugPrint('[Socket.io] 💰 Received payment.created: $data');
        _eventController.add({'event': 'payment.created', 'data': data});
      });

      _socket?.on('payment.deleted', (data) {
        debugPrint('[Socket.io] 🗑️ Received payment.deleted: $data');
        _eventController.add({'event': 'payment.deleted', 'data': data});
      });

      _socket?.on('earning.created', (data) {
        debugPrint('[Socket.io] 💵 Received earning.created: $data');
        _eventController.add({'event': 'earning.created', 'data': data});
      });

      _socket?.on('earnings.updated', (data) {
        debugPrint('[Socket.io] 📊 Received earnings.updated: $data');
        _eventController.add({'event': 'earnings.updated', 'data': data});
      });

      _socket?.on('property.status.updated', (data) {
        debugPrint('[Socket.io] 🏠 Received property.status.updated: $data');
        _eventController.add({'event': 'property.status.updated', 'data': data});
      });

      _socket?.on('notification', (data) {
        debugPrint('[Socket.io] 🔔 Received notification: $data');
        _eventController.add({'event': 'notification', 'data': data});
      });

      _socket?.onDisconnect((_) {
        debugPrint('[Socket.io] ⚠️ Disconnected from server');
        _ref.read(wsConnectedProvider.notifier).state = false;
      });

      _socket?.onError((err) {
        debugPrint('[Socket.io] ❌ Error: $err');
      });
    } catch (e) {
      debugPrint('[Socket.io] Error initializing connection: $e');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _ref.read(wsConnectedProvider.notifier).state = false;
  }
}

final webSocketProvider = Provider<WebSocketService>((ref) {
  final service = WebSocketService(ref);
  ref.onDispose(() {
    service.disconnect();
  });
  return service;
});
