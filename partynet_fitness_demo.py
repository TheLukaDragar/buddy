#!/usr/bin/env python3
"""
Partynet Fitness API Demo
========================

A Python demonstration of the Partynet Fitness API integration.
Shows authentication, genre fetching, and mix generation.

Requirements:
    pip install requests

Usage:
    python partynet_fitness_demo.py
"""

import json
import time
from typing import Any, Dict, List, Optional

import requests


class PartynetFitnessAPI:
    """Client for the Partynet Fitness API"""
    
    def __init__(self, base_url: str = "https://mod.partynet.serv.si"):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.token_expires_at: Optional[float] = None
        self.client_id = "fitness"
        self.client_secret = "v9$Tg7!kLp2@Qz6#Xw8^Rb1*"
        
    def authenticate(self) -> bool:
        """Authenticate with the API and get an access token"""
        print("🔐 Authenticating with Partynet Fitness API...")
        
        url = f"{self.base_url}/oauth2/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
            "User-Agent": "Partynet-Python-Demo/1.0"
        }
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        }
        
        try:
            response = requests.post(url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            self.access_token = token_data["access_token"]
            expires_in = token_data["expires_in"]
            self.token_expires_at = time.time() + expires_in
            
            print(f"✅ Authentication successful!")
            print(f"   Token type: {token_data['token_type']}")
            print(f"   Expires in: {expires_in} seconds")
            print(f"   Token: {self.access_token[:50]}...")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Authentication failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Response: {e.response.text}")
            return False
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers with authentication"""
        if not self.access_token:
            raise ValueError("Not authenticated. Call authenticate() first.")
            
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "User-Agent": "Partynet-Python-Demo/1.0"
        }
    
    def _check_token_expiry(self) -> bool:
        """Check if token needs refresh"""
        if not self.token_expires_at:
            return False
        return time.time() >= (self.token_expires_at - 300)  # 5 minutes before expiry
    
    def get_genres(self) -> Optional[List[str]]:
        """Get all available music genres"""
        if self._check_token_expiry():
            print("🔄 Token expired, re-authenticating...")
            if not self.authenticate():
                return None
                
        print("🎵 Fetching available genres...")
        
        url = f"{self.base_url}/fitness/genres"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            
            genres = response.json()
            print(f"✅ Found {len(genres)} genres:")
            for i, genre in enumerate(genres, 1):
                print(f"   {i:2d}. {genre}")
            
            return genres
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to fetch genres: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Response: {e.response.text}")
            return None
    
    def get_styles(self, genre: str) -> Optional[List[str]]:
        """Get available styles for a specific genre"""
        if self._check_token_expiry():
            print("🔄 Token expired, re-authenticating...")
            if not self.authenticate():
                return None
                
        print(f"🎸 Fetching styles for genre: {genre}...")
        
        url = f"{self.base_url}/fitness/genres/{genre}"
        
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            
            styles = response.json()
            print(f"✅ Found {len(styles)} styles for {genre}:")
            for i, style in enumerate(styles, 1):
                print(f"   {i:2d}. {style}")
            
            return styles
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to fetch styles: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Response: {e.response.text}")
            return None
    
    def generate_mix(self, mix_config: Dict[str, Any]) -> Optional[List[Dict]]:
        """Generate a music mix based on configuration"""
        if self._check_token_expiry():
            print("🔄 Token expired, re-authenticating...")
            if not self.authenticate():
                return None
                
        print("🎧 Generating music mix...")
        print(f"   Request: {json.dumps(mix_config, indent=2)}")
        
        url = f"{self.base_url}/fitness/mix"
        headers = self._get_headers()
        headers["Content-Type"] = "application/json"
        
        try:
            response = requests.post(url, headers=headers, json=mix_config)
            response.raise_for_status()
            
            tracks = response.json()
            print(f"✅ Generated mix with {len(tracks)} tracks:")
            
            for i, track in enumerate(tracks, 1):
                duration_min = track.get('length', 0) // 60
                duration_sec = track.get('length', 0) % 60
                print(f"   {i:2d}. {track.get('title', 'Unknown')} - {track.get('artist', 'Unknown')}")
                print(f"       Genre: {track.get('genre', 'N/A')} | BPM: {track.get('bpm', 'N/A')} | Duration: {duration_min}:{duration_sec:02d}")
            
            return tracks
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to generate mix: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    print(f"   Error details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Response: {e.response.text}")
            return None

def main():
    """Main demo function"""
    print("=" * 50)
    print("🚀 Partynet Fitness API Demo")
    print("=" * 50)
    
    # Initialize API client
    api = PartynetFitnessAPI()
    
    # Step 1: Authenticate
    if not api.authenticate():
        print("❌ Demo failed - could not authenticate")
        return
    
    print("\n" + "=" * 50)
    
    # Step 2: Get available genres
    genres = api.get_genres()
    if not genres:
        print("❌ Demo failed - could not fetch genres")
        return
    
    print("\n" + "=" * 50)
    
    # Step 3: Get styles for POP genre
    styles = api.get_styles("POP")
    if not styles:
        print("❌ Demo failed - could not fetch styles")
        return
    
    print("\n" + "=" * 50)
    
    # Step 4: Generate a mix
    mix_config = {
        "topHits": True,
        "explicitSongs": False,
        "mixParameters": [
            {
                "genre": "POP",
                "style": "POP",
                "percentage": 60,
                "energyLevel": "MID",
                "timePeriod": "2010-2020",
                "bpm": "100-150"
            },
            {
                "genre": "DANCE",
                "style": "HOUSE",
                "percentage": 40,
                "energyLevel": "HIGH",
                "timePeriod": "2015-2024",
                "bpm": "120-140"
            }
        ]
    }
    
    tracks = api.generate_mix(mix_config)
    
    print("\n" + "=" * 50)
    print("🎉 Demo completed!")
    
    if tracks:
        print(f"✅ Successfully generated a mix with {len(tracks)} tracks")
        
        # Show some example track URLs (these would be used for streaming)
        print("\n🎵 Example streaming URLs:")
        for i, track in enumerate(tracks[:3], 1):  # Show first 3 tracks
            track_url = f"https://mod.partynet.serv.si/fitness/file/{track.get('url', '')}"
            print(f"   {i}. {track_url}")
        
        print("\n💡 Note: These URLs require Bearer token authentication for streaming")
        print(f"   Authorization: Bearer {api.access_token[:30]}...")
    else:
        print("⚠️  Mix generation failed, but authentication and metadata endpoints work!")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()

