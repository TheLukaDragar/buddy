#!/usr/bin/env python3
"""
Test script to verify if Partynet API allows playing the same song twice
"""

import requests
import time
from urllib.parse import unquote

# Partynet API configuration
BASE_URL = "https://mod.partynet.serv.si"
CLIENT_ID = "fitness"
CLIENT_SECRET = "v9$Tg7!kLp2@Qz6#Xw8^Rb1*"

def get_token():
    """Authenticate and get access token"""
    print("\n=== STEP 1: Authentication ===")
    auth_url = f"{BASE_URL}/oauth2/token"

    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }

    print(f"POST {auth_url}")
    response = requests.post(auth_url, data=data)

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        token_data = response.json()
        token = token_data.get('access_token')
        print(f"✅ Token obtained: {token[:30]}...")
        return token
    else:
        print(f"❌ Authentication failed: {response.text}")
        return None

def get_mix(token):
    """Get a mix of songs"""
    print("\n=== STEP 2: Getting Mix ===")
    mix_url = f"{BASE_URL}/fitness/mix"

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }

    mix_params = {
        'topHits': True,
        'explicitSongs': True,
        'mixParameters': [{
            'genre': 'POP',
            'style': 'POP',
            'percentage': 100,
            'energyLevel': 'MID',
            'timePeriod': '2010-2020',
            'bpm': '120-140'
        }]
    }

    print(f"POST {mix_url}")
    response = requests.post(mix_url, json=mix_params, headers=headers)

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        tracks = response.json()
        print(f"✅ Got {len(tracks)} tracks")
        if len(tracks) > 0:
            print(f"First track: {tracks[0]['title']} by {tracks[0]['artist']}")
            return tracks
        return []
    else:
        print(f"❌ Mix request failed: {response.text}")
        return []

def test_play_track(token, track, attempt_num):
    """Test playing a track"""
    print(f"\n=== ATTEMPT {attempt_num}: Playing '{track['title']}' ===")

    audio_url = f"{BASE_URL}/{track['url']}"

    headers = {
        'Authorization': f'Bearer {token}',
    }

    print(f"GET {audio_url}")
    print(f"Track URL contains: {track['url'][:50]}...")

    # Try to fetch the audio file
    response = requests.get(audio_url, headers=headers, stream=True)

    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")

    if response.status_code == 200:
        # Read first few bytes to confirm we're getting audio
        content_type = response.headers.get('Content-Type', 'unknown')
        content_length = response.headers.get('Content-Length', 'unknown')

        print(f"✅ SUCCESS!")
        print(f"   Content-Type: {content_type}")
        print(f"   Content-Length: {content_length}")

        # Read a small chunk to verify it's actually audio data
        chunk = next(response.iter_content(chunk_size=1024), None)
        if chunk:
            print(f"   First bytes: {chunk[:20].hex()}")

        return True
    else:
        print(f"❌ FAILED!")
        print(f"   Error: {response.text[:200]}")
        return False

def main():
    print("=" * 60)
    print("Partynet API - Same Song Replay Test")
    print("=" * 60)

    # Step 1: Get token
    token = get_token()
    if not token:
        print("\n❌ Cannot proceed without token")
        return

    # Step 2: Get mix
    tracks = get_mix(token)
    if len(tracks) == 0:
        print("\n❌ Cannot proceed without tracks")
        return

    # Step 3: Pick the first track and try to play it multiple times
    test_track = tracks[0]

    print(f"\n{'=' * 60}")
    print(f"Testing track: {test_track['title']} by {test_track['artist']}")
    print(f"Track URL: {test_track['url']}")
    print(f"{'=' * 60}")

    # Attempt 1
    success_1 = test_play_track(token, test_track, 1)

    # Wait a moment
    print("\nWaiting 2 seconds before replay...")
    time.sleep(2)

    # Attempt 2 - Same track, same URL
    success_2 = test_play_track(token, test_track, 2)

    # Wait a moment
    print("\nWaiting 2 seconds before replay...")
    time.sleep(2)

    # Attempt 3 - Same track, same URL again
    success_3 = test_play_track(token, test_track, 3)

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Attempt 1: {'✅ SUCCESS' if success_1 else '❌ FAILED'}")
    print(f"Attempt 2: {'✅ SUCCESS' if success_2 else '❌ FAILED'}")
    print(f"Attempt 3: {'✅ SUCCESS' if success_3 else '❌ FAILED'}")

    if success_1 and success_2 and success_3:
        print("\n✅ CONCLUSION: API allows replaying the same song multiple times!")
    elif success_1 and not (success_2 or success_3):
        print("\n❌ CONCLUSION: API URLs are SINGLE-USE ONLY!")
        print("   Each play requires a new URL from the mix endpoint.")
    else:
        print("\n⚠️  CONCLUSION: Results are inconclusive.")

    # Test if we need to fetch the mix again
    if not success_2:
        print("\n" + "=" * 60)
        print("Testing if we need to fetch mix again for replay...")
        print("=" * 60)

        # Get mix again
        new_tracks = get_mix(token)
        if len(new_tracks) > 0:
            # Try to find the same song
            same_song = None
            for track in new_tracks:
                if track['title'] == test_track['title'] and track['artist'] == test_track['artist']:
                    same_song = track
                    break

            if same_song:
                print(f"\nFound same song with new URL")
                print(f"Old URL: {test_track['url'][:50]}...")
                print(f"New URL: {same_song['url'][:50]}...")
                print(f"URLs are {'SAME' if test_track['url'] == same_song['url'] else 'DIFFERENT'}")

                # Try playing with new URL
                success_new = test_play_track(token, same_song, 4)

                if success_new:
                    print("\n✅ SOLUTION: Re-fetch mix to get new URLs for replay!")
                else:
                    print("\n❌ Even new URL failed.")

if __name__ == "__main__":
    main()
