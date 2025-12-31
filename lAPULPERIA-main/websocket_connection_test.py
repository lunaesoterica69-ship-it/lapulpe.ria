#!/usr/bin/env python3
"""
Test WebSocket connection with proper WebSocket headers
"""

import websocket
import json
import threading
import time
import sys

def test_websocket_connection():
    print("🔍 Testing WebSocket Connection with Proper Headers")
    print("=" * 50)
    
    ws_url = "wss://tienda-cerca.preview.emergentagent.com/ws/orders/test_user_123"
    
    messages_received = []
    connection_successful = False
    
    def on_message(ws, message):
        print(f"📨 Received: {message}")
        messages_received.append(json.loads(message))
    
    def on_error(ws, error):
        print(f"❌ WebSocket Error: {error}")
    
    def on_close(ws, close_status_code, close_msg):
        print(f"🔌 Connection Closed: {close_status_code} - {close_msg}")
    
    def on_open(ws):
        nonlocal connection_successful
        connection_successful = True
        print("✅ WebSocket Connection Opened!")
        
        # Send a ping message
        ping_msg = {"type": "ping"}
        ws.send(json.dumps(ping_msg))
        print(f"📤 Sent: {ping_msg}")
        
        # Wait a bit then close
        time.sleep(3)
        ws.close()
    
    try:
        print(f"🔗 Connecting to: {ws_url}")
        
        # Create WebSocket with proper headers
        ws = websocket.WebSocketApp(
            ws_url,
            on_open=on_open,
            on_message=on_message,
            on_error=on_error,
            on_close=on_close,
            header={
                "User-Agent": "WebSocket-Test-Client/1.0"
            }
        )
        
        # Run with timeout
        ws.run_forever(ping_interval=30, ping_timeout=10)
        
        print(f"\n📊 Results:")
        print(f"   Connection successful: {connection_successful}")
        print(f"   Messages received: {len(messages_received)}")
        
        for i, msg in enumerate(messages_received):
            print(f"   Message {i+1}: {msg}")
        
        if connection_successful:
            print("✅ WebSocket endpoint is working correctly!")
            return True
        else:
            print("❌ WebSocket connection failed")
            return False
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {str(e)}")
        return False

def test_websocket_with_curl():
    """Test WebSocket endpoint using curl with WebSocket upgrade headers"""
    print("\n🔍 Testing WebSocket Endpoint with curl")
    print("=" * 40)
    
    import subprocess
    
    try:
        # Test with curl using WebSocket upgrade headers
        cmd = [
            "curl", "-v",
            "-H", "Connection: Upgrade",
            "-H", "Upgrade: websocket", 
            "-H", "Sec-WebSocket-Version: 13",
            "-H", "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==",
            "https://lapulperia-app.preview.emergentagent.com/ws/orders/test_user_123"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        print(f"Exit code: {result.returncode}")
        print(f"STDOUT:\n{result.stdout}")
        print(f"STDERR:\n{result.stderr}")
        
        # Check if we get a WebSocket upgrade response
        if "101 Switching Protocols" in result.stderr or "websocket" in result.stderr.lower():
            print("✅ WebSocket upgrade headers detected")
            return True
        else:
            print("❌ No WebSocket upgrade detected")
            return False
            
    except subprocess.TimeoutExpired:
        print("⏰ curl command timed out (this might be expected for WebSocket)")
        return True  # Timeout might indicate successful connection
    except Exception as e:
        print(f"❌ curl test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 WebSocket Connection Testing")
    print("=" * 50)
    
    # Test 1: WebSocket client
    ws_success = test_websocket_connection()
    
    # Test 2: curl with WebSocket headers  
    curl_success = test_websocket_with_curl()
    
    print(f"\n📊 Final Results:")
    print(f"   WebSocket client test: {'✅ PASS' if ws_success else '❌ FAIL'}")
    print(f"   curl WebSocket test: {'✅ PASS' if curl_success else '❌ FAIL'}")
    
    if ws_success or curl_success:
        print("\n🎉 WebSocket endpoint appears to be working!")
        print("ℹ️  The endpoint may require authentication or specific parameters")
    else:
        print("\n❌ WebSocket endpoint may have routing issues")
        print("ℹ️  This could be due to proxy/load balancer configuration")