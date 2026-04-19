#!/usr/bin/env python3
"""Migration: Fix old analysis records by setting saved_filename"""

from pymongo import MongoClient
import os

client = MongoClient('mongodb://localhost:27017')
db = client['brain_tumor_db']
analyses = db['analysis_history']

# Find all records where saved_filename is missing or incorrect
broken_records = list(analyses.find({
    "$or": [
        {"saved_filename": {"$exists": False}},
        {"saved_filename": {"$in": ["", None]}}
    ]
}))

print(f"Found {len(broken_records)} records with missing/broken saved_filename")

UPLOAD_DIR = "D:\\Brain-tumor-detection-of-MRI-images-using-CNN-main\\web_app\\backend\\uploads"

fixed_count = 0
for record in broken_records:
    analysis_id = record["_id"]
    original_filename = record.get("filename")
    
    if not original_filename:
        print(f"  ⚠️  {analysis_id}: No filename to work with")
        continue
    
    # Look for matching files in the uploads directory
    # Try to find a file with a UUID name that matches the pattern
    upload_files = os.listdir(UPLOAD_DIR) if os.path.exists(UPLOAD_DIR) else []
    
    # Find the most recent file uploaded (heuristic approach)
    # In reality, we should match by upload time
    # For now, we'll try to use the original filename if it exists
    
    # Try common patterns
    import uuid
    
    # First, check if original filename exists directly
    if os.path.exists(os.path.join(UPLOAD_DIR, original_filename)):
        saved_name = original_filename
        print(f"  ✅ {analysis_id}: Found original file '{original_filename}'")
    else:
        # The file was probably saved with a UUID name
        # Look for segmentation path to infer the saved filename
        seg_path = record.get("segmentation_path")
        if seg_path:
            # Extract UUID from segmentation path
            if "_segmented" in seg_path:
                base_name = seg_path.replace("_segmented.png", ".jpg").replace("_segmented.png", ".jpg")
                # Check if this file exists
                if os.path.exists(os.path.join(UPLOAD_DIR, base_name)):
                    saved_name = base_name
                    print(f"  ✅ {analysis_id}: Inferred from segmentation path: '{base_name}'")
                else:
                    # Try with jpg extension
                    base_name = seg_path.replace("_segmented.png", ".jpg")
                    if os.path.exists(os.path.join(UPLOAD_DIR, base_name)):
                        saved_name = base_name
                        print(f"  ✅ {analysis_id}: Inferred with .jpg: '{base_name}'")
                    else:
                        print(f"  ⚠️  {analysis_id}: Could not find file for segmentation '{seg_path}'")
                        continue
            else:
                print(f"  ⚠️  {analysis_id}: No segmentation path to infer from")
                continue
        else:
            print(f"  ⚠️  {analysis_id}: Could not determine saved filename")
            continue
    
    # Update the record
    result = analyses.update_one(
        {"_id": analysis_id},
        {"$set": {"saved_filename": saved_name}}
    )
    
    if result.modified_count > 0:
        fixed_count += 1
        print(f"  → Updated saved_filename to: '{saved_name}'")

print(f"\n{'='*60}")
print(f"Migration complete: Fixed {fixed_count} records")
print(f"{'='*60}")
