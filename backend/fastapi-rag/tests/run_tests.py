#!/usr/bin/env python3
"""
Test runner script for the RAG application.
"""

import sys
import os
import subprocess
import asyncio

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def run_pytest():
    """Run pytest on all test files."""
    print("🧪 Running pytest tests...")
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "-v", "--tb=short"
        ], cwd=os.path.dirname(__file__))
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running pytest: {e}")
        return False

def run_import_test():
    """Run the import test manually."""
    print("\n🔍 Running import test...")
    try:
        from test_imports import *
        print("✅ Import test completed successfully")
        return True
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

async def run_reset_collection():
    """Run the reset collection utility."""
    print("\n🔄 Running reset collection utility...")
    try:
        from reset_collection import reset_and_reingest
        await reset_and_reingest()
        print("✅ Reset collection completed successfully")
        return True
    except Exception as e:
        print(f"❌ Reset collection failed: {e}")
        return False

def main():
    """Main test runner."""
    print("🚀 Starting RAG Application Tests")
    print("=" * 50)
    
    # Run pytest tests
    pytest_success = run_pytest()
    
    # Run import test
    import_success = run_import_test()
    
    # Run reset collection (optional)
    print("\n❓ Would you like to run the reset collection utility? (y/n): ", end="")
    try:
        user_input = input().lower().strip()
        if user_input in ['y', 'yes']:
            reset_success = asyncio.run(run_reset_collection())
        else:
            reset_success = True  # Skip this test
    except KeyboardInterrupt:
        print("\n⏹️  Skipping reset collection")
        reset_success = True
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Pytest Tests: {'✅ PASSED' if pytest_success else '❌ FAILED'}")
    print(f"   Import Test: {'✅ PASSED' if import_success else '❌ FAILED'}")
    print(f"   Reset Collection: {'✅ PASSED' if reset_success else '❌ FAILED'}")
    
    if all([pytest_success, import_success, reset_success]):
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
