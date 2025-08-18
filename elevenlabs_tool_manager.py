#!/usr/bin/env python3
"""
ElevenLabs Tool Manager
Fetches, edits, and syncs conversational AI tools via ElevenLabs API
"""

import json
import os
import sys
import requests
from typing import Dict, List, Optional
from datetime import datetime

class ElevenLabsToolManager:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.tools_url = "https://api.elevenlabs.io/v1/convai/tools"
        self.agents_url = "https://api.elevenlabs.io/v1/convai/agents"
        self.headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json"
        }
    
    def list_tools(self) -> Dict:
        """Fetch all tools from ElevenLabs"""
        print("🔍 Fetching tools from ElevenLabs...")
        
        response = requests.get(self.tools_url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data.get('tools', []))} tools")
            return data
        else:
            print(f"❌ Error fetching tools: {response.status_code}")
            print(response.text)
            return {}
    
    def get_tool(self, tool_id: str) -> Dict:
        """Get specific tool by ID"""
        print(f"🔍 Fetching tool: {tool_id}")
        
        response = requests.get(f"{self.tools_url}/{tool_id}", headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error fetching tool {tool_id}: {response.status_code}")
            print(response.text)
            return {}
    
    def create_tool(self, tool_config: Dict) -> Dict:
        """Create a new tool"""
        print(f"➕ Creating tool: {tool_config.get('name', 'Unknown')}")
        
        response = requests.post(
            self.tools_url, 
            headers=self.headers, 
            json={"tool_config": tool_config}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Created tool: {data.get('id')}")
            return data
        else:
            print(f"❌ Error creating tool: {response.status_code}")
            print(response.text)
            return {}
    
    def update_tool(self, tool_id: str, tool_config: Dict) -> Dict:
        """Update existing tool"""
        print(f"🔄 Updating tool: {tool_id}")
        
        response = requests.patch(
            f"{self.tools_url}/{tool_id}", 
            headers=self.headers, 
            json={"tool_config": tool_config}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Updated tool: {tool_id}")
            return data
        else:
            print(f"❌ Error updating tool {tool_id}: {response.status_code}")
            print(response.text)
            return {}
    
    def delete_tool(self, tool_id: str) -> bool:
        """Delete a tool"""
        print(f"🗑️ Deleting tool: {tool_id}")
        
        response = requests.delete(f"{self.tools_url}/{tool_id}", headers=self.headers)
        
        if response.status_code in [200, 204]:  # 200 OK or 204 No Content are both success
            print(f"✅ Deleted tool: {tool_id}")
            return True
        else:
            print(f"❌ Error deleting tool {tool_id}: {response.status_code}")
            print(response.text)
            return False
    
    def save_tools_to_file(self, tools_data: Dict, filename: str = "elevenlabs_tools.json"):
        """Save tools data to JSON file with timestamp - DUMP EVERYTHING"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename_with_timestamp = f"{timestamp}_{filename}"
        
        # Just dump the raw data with minimal wrapper
        export_data = {
            "exported_at": datetime.now().isoformat(),
            "tools": tools_data
        }
        
        with open(filename_with_timestamp, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved {len(tools_data.get('tools', []))} tools to: {filename_with_timestamp}")
        return filename_with_timestamp
    
    def convert_client_tools_to_elevenlabs(self, client_tools_file: str):
        """Convert client tools JSON to ElevenLabs format"""
        print(f"🔄 Converting client tools from: {client_tools_file}")
        
        with open(client_tools_file, 'r', encoding='utf-8') as f:
            client_data = json.load(f)
        
        elevenlabs_tools = []
        
        for tool in client_data.get('tools', []):
            # Convert client tool format to ElevenLabs webhook format
            elevenlabs_tool = {
                "name": tool.get('name'),
                "description": tool.get('description'),
                "type": "client",  # Assuming these are client-side tools
                "response_timeout_secs": tool.get('response_timeout_secs', 20),
                "disable_interruptions": tool.get('disable_interruptions', False),
                "force_pre_tool_speech": tool.get('force_pre_tool_speech', "auto"),
                "assignments": tool.get('assignments', []),
                "dynamic_variables": tool.get('dynamic_variables', {}),
                "parameters": tool.get('parameters', [])
            }
            elevenlabs_tools.append(elevenlabs_tool)
        
        # Save converted format
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        output_file = f"{timestamp}_converted_for_elevenlabs.json"
        
        output_data = {
            "metadata": {
                "converted_at": datetime.now().isoformat(),
                "source_file": client_tools_file,
                "total_tools": len(elevenlabs_tools)
            },
            "tools": elevenlabs_tools
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Converted {len(elevenlabs_tools)} tools to: {output_file}")
        return output_file
    
    def sync_tools_from_file(self, filename: str, dry_run: bool = True, delete_missing: bool = False):
        """Sync tools from edited file back to ElevenLabs"""
        print(f"🔄 {'[DRY RUN] ' if dry_run else ''}Syncing tools from: {filename}")
        
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        current_tools = self.list_tools()
        current_tool_names = {tool['tool_config']['name']: tool['id'] for tool in current_tools.get('tools', [])}
        
        # Get tools from file - handle nested structure
        tools_data = data.get('tools', [])
        if isinstance(tools_data, dict) and 'tools' in tools_data:
            tools_data = tools_data['tools']
        
        file_tool_names = set()
        for tool in tools_data:
            tool_name = tool.get('name') if hasattr(tool, 'get') else tool.get('tool_config', {}).get('name') if isinstance(tool, dict) else None
            if tool_name:
                file_tool_names.add(tool_name)
        
        sync_stats = {"created": 0, "updated": 0, "deleted": 0, "skipped": 0, "errors": 0}
        
        # Handle deletions first
        if delete_missing:
            tools_to_delete = set(current_tool_names.keys()) - file_tool_names
            for tool_name in tools_to_delete:
                tool_id = current_tool_names[tool_name]
                if dry_run:
                    print(f"🗑️ Would delete: {tool_name} (ID: {tool_id})")
                    sync_stats["deleted"] += 1
                else:
                    if self.delete_tool(tool_id):
                        sync_stats["deleted"] += 1
                        print(f"🗑️ Deleted: {tool_name}")
                    else:
                        sync_stats["errors"] += 1
        
        # Handle creates/updates
        for tool in tools_data:
            # Handle both direct tool format and tool_config nested format
            if 'tool_config' in tool:
                tool_data = tool['tool_config']
                tool_name = tool_data.get('name')
            else:
                tool_data = tool
                tool_name = tool_data.get('name')
            
            if not tool_name:
                print(f"⚠️ Skipping tool without name")
                sync_stats["skipped"] += 1
                continue
            
            tool_config = {
                "name": tool_name,
                "description": tool_data.get('description', ''),
                "type": tool_data.get('type', 'client'),
                "response_timeout_secs": tool_data.get('response_timeout_secs', 20),
                "disable_interruptions": tool_data.get('disable_interruptions', False),
                "force_pre_tool_speech": tool_data.get('force_pre_tool_speech', False),
                "assignments": tool_data.get('assignments', []),
                "dynamic_variables": tool_data.get('dynamic_variables', {}),
            }
            
            # Add parameters for client tools
            if tool_data.get('parameters') is not None:
                tool_config["parameters"] = tool_data.get('parameters')
            
            # Add expects_response for client tools
            if 'expects_response' in tool_data:
                tool_config["expects_response"] = tool_data.get('expects_response', False)
            
            # Add API schema if it's a webhook tool
            if tool_data.get('api_schema'):
                tool_config["api_schema"] = tool_data.get('api_schema')
            
            if dry_run:
                if tool_name in current_tool_names:
                    print(f"🔄 Would update: {tool_name}")
                    sync_stats["updated"] += 1
                else:
                    print(f"➕ Would create: {tool_name}")
                    sync_stats["created"] += 1
            else:
                if tool_name in current_tool_names:
                    # Update existing tool - GET current tool first, then update
                    tool_id = current_tool_names[tool_name]
                    print(f"🔄 Updating tool: {tool_id}")
                    
                    # Get current tool to merge with new config
                    current_tool = self.get_tool(tool_id)
                    if current_tool and 'tool_config' in current_tool:
                        # Merge current config with new config
                        merged_config = current_tool['tool_config'].copy()
                        merged_config.update(tool_config)
                        result = self.update_tool(tool_id, merged_config)
                    else:
                        # Fallback to direct update if GET fails
                        result = self.update_tool(tool_id, tool_config)
                    
                    if result:
                        sync_stats["updated"] += 1
                        print(f"✅ Updated tool: {tool_id}")
                    else:
                        sync_stats["errors"] += 1
                else:
                    # Create new tool
                    result = self.create_tool(tool_config)
                    if result:
                        sync_stats["created"] += 1
                    else:
                        sync_stats["errors"] += 1
        
        print(f"\n📊 Sync Summary:")
        print(f"   Created: {sync_stats['created']}")
        print(f"   Updated: {sync_stats['updated']}")
        if delete_missing:
            print(f"   Deleted: {sync_stats['deleted']}")
        print(f"   Skipped: {sync_stats['skipped']}")
        print(f"   Errors: {sync_stats['errors']}")
        
        return sync_stats
    
    def list_agents(self) -> Dict:
        """Fetch all agents from ElevenLabs"""
        print("🔍 Fetching agents from ElevenLabs...")
        
        response = requests.get(self.agents_url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data.get('agents', []))} agents")
            return data
        else:
            print(f"❌ Error fetching agents: {response.status_code}")
            print(response.text)
            return {}
    
    def get_agent(self, agent_id: str) -> Dict:
        """Get specific agent by ID"""
        print(f"🔍 Fetching agent: {agent_id}")
        
        response = requests.get(f"{self.agents_url}/{agent_id}", headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error fetching agent {agent_id}: {response.status_code}")
            print(response.text)
            return {}
    
    def update_agent(self, agent_id: str, agent_config: Dict) -> Dict:
        """Update existing agent"""
        print(f"🔄 Updating agent: {agent_id}")
        
        response = requests.patch(
            f"{self.agents_url}/{agent_id}", 
            headers=self.headers, 
            json=agent_config
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Updated agent: {agent_id}")
            return data
        else:
            print(f"❌ Error updating agent {agent_id}: {response.status_code}")
            print(response.text)
            return {}
    
    def update_agent_tool_ids(self, agent_id: str, dry_run: bool = True) -> bool:
        """Update agent's tool IDs to match current tools"""
        print(f"🔄 {'[DRY RUN] ' if dry_run else ''}Updating agent tool IDs: {agent_id}")
        
        # Get current tools
        tools_data = self.list_tools()
        if not tools_data:
            print("❌ Could not fetch tools")
            return False
        
        # Get current agent
        agent_data = self.get_agent(agent_id)
        if not agent_data:
            print("❌ Could not fetch agent")
            return False
        
        # Extract tool IDs
        current_tool_ids = [tool['id'] for tool in tools_data.get('tools', [])]
        current_tool_names = {tool['tool_config']['name']: tool['id'] for tool in tools_data.get('tools', [])}
        
        # Get current agent tool IDs
        current_agent_tool_ids = agent_data.get('conversation_config', {}).get('agent', {}).get('prompt', {}).get('tool_ids', [])
        
        print(f"📊 Current agent has {len(current_agent_tool_ids)} tool IDs")
        print(f"📊 Available tools: {len(current_tool_ids)}")
        
        if dry_run:
            print("🔍 Tool ID mapping:")
            for tool_name, tool_id in current_tool_names.items():
                status = "✅" if tool_id in current_agent_tool_ids else "➕"
                print(f"   {status} {tool_name}: {tool_id}")
            
            print(f"\n📊 Summary:")
            print(f"   Would update tool_ids to include all {len(current_tool_ids)} tools")
            return True
        else:
            # Update agent with all current tool IDs
            update_config = {
                "conversation_config": {
                    "agent": {
                        "prompt": {
                            "tool_ids": current_tool_ids
                        }
                    }
                }
            }
            
            result = self.update_agent(agent_id, update_config)
            if result:
                print(f"✅ Updated agent tool IDs: {len(current_tool_ids)} tools assigned")
                return True
            else:
                print("❌ Failed to update agent")
                return False


def main():
    # Get API key from environment or prompt
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        api_key = input("Enter your ElevenLabs API key: ").strip()
    
    if not api_key:
        print("❌ API key is required")
        sys.exit(1)
    
    manager = ElevenLabsToolManager(api_key)
    
    if len(sys.argv) < 2:
        print("🤖 ElevenLabs Tool Manager")
        print("\nUsage:")
        print("  python elevenlabs_tool_manager.py list                                   # List current tools")
        print("  python elevenlabs_tool_manager.py export                                 # Export tools to JSON")
        print("  python elevenlabs_tool_manager.py convert <file>                         # Convert client tools to ElevenLabs format")
        print("  python elevenlabs_tool_manager.py sync <file> [--commit] [--delete]     # Sync tools from file (dry-run by default)")
        print("  python elevenlabs_tool_manager.py delete <tool_id>                       # Delete a tool")
        print("  python elevenlabs_tool_manager.py list-agents                            # List current agents")
        print("  python elevenlabs_tool_manager.py update-agent <agent_id> [--commit]    # Update agent tool IDs to match current tools")
        print("  python elevenlabs_tool_manager.py sync-agent <file> <agent_id> [--commit] [--delete]  # Sync tools and update agent")
        print("\nExamples:")
        print("  python elevenlabs_tool_manager.py export")
        print("  python elevenlabs_tool_manager.py convert mm_updated.json")
        print("  python elevenlabs_tool_manager.py sync 2024-01-15_14-30-00_elevenlabs_tools.json --commit")
        print("  python elevenlabs_tool_manager.py sync 2024-01-15_14-30-00_elevenlabs_tools.json --delete --commit")
        print("  python elevenlabs_tool_manager.py update-agent agent_12345 --commit")
        print("  python elevenlabs_tool_manager.py sync-agent tools.json agent_12345 --delete --commit")
        
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    if command == "list":
        tools_data = manager.list_tools()
        if tools_data:
            print(f"\n📋 Current Tools ({len(tools_data.get('tools', []))} total):")
            for tool in tools_data.get('tools', []):
                config = tool['tool_config']
                usage = tool.get('usage_stats', {})
                print(f"  • {config.get('name')} ({config.get('type')}) - {usage.get('total_calls', 0)} calls")
    
    elif command == "export":
        tools_data = manager.list_tools()
        if tools_data:
            filename = manager.save_tools_to_file(tools_data)
            print(f"\n✅ Tools exported! Edit the file and use 'sync' to upload changes.")
    
    elif command == "convert":
        if len(sys.argv) < 3:
            print("❌ Please specify the client tools file to convert")
            sys.exit(1)
        
        client_file = sys.argv[2]
        if not os.path.exists(client_file):
            print(f"❌ File not found: {client_file}")
            sys.exit(1)
        
        converted_file = manager.convert_client_tools_to_elevenlabs(client_file)
        print(f"\n✅ Converted! Use 'sync {converted_file} --commit' to upload to ElevenLabs.")
    
    elif command == "sync":
        if len(sys.argv) < 3:
            print("❌ Please specify the JSON file to sync")
            sys.exit(1)
        
        filename = sys.argv[2]
        if not os.path.exists(filename):
            print(f"❌ File not found: {filename}")
            sys.exit(1)
        
        dry_run = "--commit" not in sys.argv
        delete_missing = "--delete" in sys.argv
        
        if dry_run:
            print("🔍 DRY RUN MODE - No changes will be made. Use --commit to apply changes.")
        if delete_missing:
            print("🗑️ DELETE MODE - Tools missing from file will be deleted.")
        
        manager.sync_tools_from_file(filename, dry_run=dry_run, delete_missing=delete_missing)
    
    elif command == "delete":
        if len(sys.argv) < 3:
            print("❌ Please specify the tool ID to delete")
            sys.exit(1)
        
        tool_id = sys.argv[2]
        confirm = input(f"⚠️ Are you sure you want to delete tool {tool_id}? (y/N): ")
        if confirm.lower() == 'y':
            manager.delete_tool(tool_id)
        else:
            print("❌ Deletion cancelled")
    
    elif command == "list-agents":
        agents_data = manager.list_agents()
        if agents_data:
            print(f"\n📋 Current Agents ({len(agents_data.get('agents', []))} total):")
            for agent in agents_data.get('agents', []):
                tool_count = len(agent.get('conversation_config', {}).get('agent', {}).get('prompt', {}).get('tool_ids', []))
                print(f"  • {agent.get('name', 'Unnamed')} (ID: {agent.get('agent_id')}) - {tool_count} tools")
    
    elif command == "update-agent":
        if len(sys.argv) < 3:
            print("❌ Please specify the agent ID to update")
            sys.exit(1)
        
        agent_id = sys.argv[2]
        dry_run = "--commit" not in sys.argv
        
        if dry_run:
            print("🔍 DRY RUN MODE - No changes will be made. Use --commit to apply changes.")
        
        manager.update_agent_tool_ids(agent_id, dry_run=dry_run)
    
    elif command == "sync-agent":
        if len(sys.argv) < 4:
            print("❌ Please specify the JSON file and agent ID")
            print("Usage: python elevenlabs_tool_manager.py sync-agent <file> <agent_id> [--commit] [--delete]")
            sys.exit(1)
        
        filename = sys.argv[2]
        agent_id = sys.argv[3]
        
        if not os.path.exists(filename):
            print(f"❌ File not found: {filename}")
            sys.exit(1)
        
        dry_run = "--commit" not in sys.argv
        delete_missing = "--delete" in sys.argv
        
        if dry_run:
            print("🔍 DRY RUN MODE - No changes will be made. Use --commit to apply changes.")
        if delete_missing:
            print("🗑️ DELETE MODE - Tools missing from file will be deleted.")
        
        print("🔄 Step 1: Syncing tools...")
        sync_result = manager.sync_tools_from_file(filename, dry_run=dry_run, delete_missing=delete_missing)
        
        if sync_result and sync_result.get('errors', 0) == 0:
            print("\n🔄 Step 2: Updating agent tool IDs...")
            manager.update_agent_tool_ids(agent_id, dry_run=dry_run)
        else:
            print("❌ Tool sync had errors, skipping agent update")
    
    else:
        print(f"❌ Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
