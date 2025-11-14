# 🚀 On Cloud Payroll

A modern, professional web application for consolidated batch payment processing. Process monthly payroll, weekly payroll, and manual payments all in one place.

## ✨ Features

- ✅ **CSV File Support** - Direct upload of PetPooja payroll CSV files
- 📊 **Monthly Payroll** - Full breakdown with earnings, deductions, and take-home
- 📅 **Weekly Payroll** - Simple gross pay processing
- 💰 **Manual Payments** - Add rent, advances, contractor charges, etc.
- 🏦 **Bank File Generation** - Kotak Mahindra Bank format
- 📒 **Tally Journal** - Ready for upload via Suvit.io
- 🎯 **Batch Processing** - Consolidate all payments in one batch
- 🔒 **100% Local** - All processing happens in your browser, data never leaves your device

## 🎯 What's Fixed in Version 2.0

- ✅ **CSV Reading Fixed** - No more "0 employees" errors!
- ✅ **Proper file parsing** - Correctly reads comma-separated values
- ✅ **On Cloud Branding** - Company name and contact info included
- ✅ **Better UX** - Clear instructions and helpful messages

## 📋 Prerequisites

Before you deploy, make sure you have:
- A GitHub account (free)
- A Vercel account (free - we'll create this together)

That's it! No coding knowledge required.

## 🚀 Deployment Instructions (Step-by-Step)

### Step 1: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Follow the instructions to create your account
4. Verify your email address

### Step 2: Upload Your Project to GitHub

**Method A: Using GitHub Website (Easiest - No Technical Knowledge Required)**

1. Go to [github.com/new](https://github.com/new)
2. Name your repository: `oncloud-payroll`
3. Keep it **Private** (important for business data security)
4. Click "Create repository"
5. You'll see a page with instructions - **ignore those for now**
6. Look for the button that says "uploading an existing file" and click it
7. Drag and drop the ZIP file I'll provide you
8. Click "Commit changes"

**Method B: I'll provide you a pre-configured link (Even Easier)**
- I'll create instructions for this after we finish building

### Step 3: Deploy to Vercel (FREE Hosting)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub" (this connects your GitHub account)
4. Authorize Vercel to access your GitHub
5. Click "Import Project"
6. Select your `oncloud-payroll` repository
7. Vercel will auto-detect it's a Vite project
8. Click "Deploy"
9. Wait 2-3 minutes while Vercel builds your app
10. 🎉 Done! You'll get a link like `oncloud-payroll.vercel.app`

### Step 4: Access Your App

1. Click the link Vercel provides
2. Bookmark it for easy access
3. You can now use your payroll system from anywhere!

### Step 5: (Optional) Custom Domain

Want `payroll.yourcompany.com` instead of `.vercel.app`?
1. Buy a domain from GoDaddy, Namecheap, etc. (~₹800/year)
2. In Vercel dashboard, click "Domains"
3. Follow instructions to connect your domain
4. Takes 24-48 hours to propagate

## 📱 How to Use

1. **Open your app** - Visit your Vercel URL
2. **Click "Start New Payment Batch"**
3. **Upload monthly payroll** - CSV from PetPooja (if you have one)
4. **Upload weekly payroll** - CSV from PetPooja (if you have one)
5. **Add manual payments** - Rent, advances, etc. (if needed)
6. **Review batch summary** - Check totals are correct
7. **Generate files** - Click both buttons to download
8. **Upload to bank** - Upload bank file to Kotak portal
9. **Upload to Tally** - Upload Tally file via Suvit.io
10. **Done!** - All payments processed in one go

## 📊 Required CSV Format

### Monthly Payroll CSV Columns:
```
Name, Gross Earnings, Other Earnings, Overtime, Extras, ESIC, 
Loan & Advance, Penalities, Take Home, Bank Name, Bank Account No, 
IFSC Code, Branch Name
```

### Weekly Payroll CSV Columns:
```
Name, Gross Pay, Overtime, Adjustment, Penalities, Loan & Adv,
Bank Name, Bank Account No, IFSC Code, Branch Name
```

## 🔧 Configuration

All configuration is in the `CONFIG` object in `src/App.jsx`:

- **Company Account**: Update `companyAccount` with your Kotak account number
- **Company Name**: Already set to "On Cloud"
- **Support Email**: Already set to rajesh@oncloudindia.com
- **Tally Ledgers**: Customize ledger names to match your Tally setup
- **Manual Payment Types**: Add/remove payment categories as needed

## 🆘 Troubleshooting

### Problem: Still showing "0 employees"
**Solution**: 
- Make sure your file is CSV format (not Excel .xlsx)
- Open the CSV in Notepad and verify commas are present between columns
- Check column names match exactly (case-sensitive)

### Problem: Can't deploy to Vercel
**Solution**:
- Make sure you've connected GitHub to Vercel
- Check that all files are uploaded to GitHub
- Contact support: rajesh@oncloudindia.com

### Problem: Generated files are empty
**Solution**:
- Upload at least one payroll file or add manual payments first
- Check the batch summary shows correct totals before generating

## 📞 Support

**Email**: rajesh@oncloudindia.com
**Company**: On Cloud

## 🔮 Coming Soon (Phase 2)

- 📊 Master Data Management
- 🔄 Auto-update bank details from payroll
- 📥 Bulk import employees/vendors
- ⚠️ Smart validation (catch errors like 50000 instead of 500)
- 🚫 Duplicate detection
- ✅ Approval workflow
- 🤖 AI-powered suggestions

## 📄 License

Proprietary - © 2024 On Cloud. All rights reserved.

## 🙏 Credits

Built with:
- React 18
- Vite
- Tailwind CSS
- Lucide Icons

---

**Version**: 2.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Production Ready
