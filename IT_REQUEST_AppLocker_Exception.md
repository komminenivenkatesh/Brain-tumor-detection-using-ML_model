# AppLocker Exception Request - Development Environment

**To:** IT Department / System Administrators  
**From:** [Your Name]  
**Date:** April 29, 2026  
**Priority:** Development Blocker

---

## Summary

I am requesting an AppLocker exception for my Python development environment to allow machine learning and security libraries to execute. These are standard, legitimate development tools needed for a brain tumor detection ML project.

---

## Business Context

- **Project:** Brain Tumor Detection System
- **Purpose:** Academic/developmental machine learning application
- **Tools Required:** Python data science libraries (TensorFlow, cryptography, etc.)
- **Impact:** Cannot run local development or testing without this exception

---

## Technical Details

**Environment:**
- Location: `C:\Users\kommi\Desktop\BrainTumor-Project`
- Python Environment: `.venv` virtual environment
- Python Version: 3.10

**Issue:**
AppLocker is currently blocking DLL files from legitimate Python packages, preventing the application from starting. This blocks:
- TensorFlow (machine learning)
- Cryptography (security/JWT authentication)
- Other data science libraries (NumPy, SciPy, etc.)

---

## Requested AppLocker Exception

Please add the following path to the AppLocker whitelist (Executable Rules or DLL Rules):

```
C:\Users\kommi\Desktop\BrainTumor-Project\.venv\Lib\site-packages\**\*.pyd
C:\Users\kommi\Desktop\BrainTumor-Project\.venv\Lib\site-packages\**\*.dll
C:\Users\kommi\Desktop\BrainTumor-Project\.venv\Lib\site-packages\**\*.so
```

**Scope:** User-specific, limited to development folder only  
**Security:** Virtual environment isolated from system Python  
**Risk Level:** LOW - Limited to user's development folder

---

## Implementation Steps (for IT)

1. Open **Group Policy Editor** (`gpedit.msc`)
2. Navigate to: `Computer Configuration > Windows Settings > Security Settings > Application Control Policies > AppLocker`
3. Select **DLL Rules** or **Executable Rules**
4. Create exception rule for the paths listed above
5. Set rule to **Allow**
6. Apply policy and restart (if required by policy)

---

## Verification

Once applied, the following should work:
```powershell
# This should execute without DLL blocking errors
python -c "import tensorflow; print('✅ TensorFlow working')"
```

---

## Contact Information

**User:** [Your Name]  
**Email:** [Your Email]  
**Phone:** [Your Phone]  
**Ticket:** [Optional - IT ticket number if available]

---

## Additional Notes

- This exception is **temporary** and limited to development
- Can be revoked at any time
- Does not require system-wide changes
- All tools are open-source and publicly vetted

**Thank you for your assistance!**

---

**Attachment:** Project folder structure (for reference)
```
BrainTumor-Project/
├── .venv/                    ← Virtual environment (requesting exception)
├── web_app/
│   ├── backend/             ← Python FastAPI server
│   └── frontend/            ← React/JavaScript interface
└── [project files]
```
