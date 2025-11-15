import React, { useState } from 'react';
import { Upload, FileText, Download, Home, DollarSign, Users, AlertCircle, CheckCircle, Trash2, Plus, List } from 'lucide-react';

// Configuration object containing all Tally ledger names and payment mappings
const CONFIG = {
  ledgers: {
    bank: "Kotak Mahindra Bank",
    salary: "Salary A/c",
    wages: "Wages",
    otherEarnings: "Other Earnings",
    overtime: "Overtime",
    esi: "ESI Payable",
    loan: "Staff Loan & Advance",
    extraPay: "Extra Pay",
    penalties: "Penalties",
    tdsSalary: "TDS Payable - Salary"
  },
  narrations: {
    monthly: "Monthly payroll",
    weekly: "Weekly payroll",
    manual: "Manual Entry",
    bankPay: "Bank Payment"
  },
  companyAccount: "4647261831",
  companyName: "On Cloud",
  supportEmail: "rajesh@oncloudindia.com",
  manualPayments: {
    "Advance": { dr: "[Payee]", tds: null, rate: 0 },
    "Loan": { dr: "[Payee] loan a/c", tds: null, rate: 0 },
    "Overtime": { dr: "Overtime", tds: null, rate: 0 },
    "Rent": { dr: "Factory Rent A/c @GST", tds: "TDS 10%", rate: 0.1 },
    "Interest": { dr: "Loan Interest A/c", tds: "Tds on Interest", rate: 0.1 },
    "Wages": { dr: "Wages", tds: null, rate: 0 },
    "Salary": { dr: "Salary A/c", tds: null, rate: 0 },
    "Payment": { dr: "[Payee]", tds: null, rate: 0 },
    "Cutting Charges": { dr: "Cutting Charges", tds: "TDS 1%", rate: 0.01 },
    "Stitching Charges": { dr: "Stitching Charges", tds: "TDS 1%", rate: 0.01 },
    "Cartage Account": { dr: "Cartage A/c", tds: "TDS 1%", rate: 0.01 },
    "Petrol": { dr: "Petrol", tds: null, rate: 0 },
    "Professional Fees": { dr: "Professional Fees A/c", tds: "TDS 10%", rate: 0.1 }
  }
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [paymentBatch, setPaymentBatch] = useState({
    monthly: null,
    weekly: null,
    manual: []
  });
  const [errors, setErrors] = useState([]);
  const [manualPaymentForm, setManualPaymentForm] = useState({
    type: 'Advance',
    payeeName: '',
    amount: '',
    bankName: '',
    ifsc: '',
    accountNo: '',
    branchName: '',
    narration: ''
  });

  // Format date as DD/MM/YYYY
  const formatDate = (date = new Date()) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  // Generate unique journal and reference numbers
  const generateJournalNumber = (prefix, index) => {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`;
    return `${prefix}-${dateStr}-${index.toString().padStart(3, '0')}`;
  };

  // Parse CSV (comma-separated) data from uploaded file
  const parseExcelData = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('File appears to be empty or invalid');
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() || '';
      });
      data.push(row);
    }
    
    return data;
  };

  // Validate employee data and return errors
  const validateEmployeeData = (employees, isWeekly) => {
    const errs = [];
    employees.forEach((emp, idx) => {
      const takeHome = isWeekly ? 
        parseFloat(emp['Gross Pay'] || 0) : 
        parseFloat(emp['Take Home'] || 0);
      
      if (takeHome > 0) {
        if (!emp['Bank Account No']) {
          errs.push(`Row ${idx + 2}: ${emp.Name} has earnings but missing bank account number`);
        }
        if (!emp['IFSC Code']) {
          errs.push(`Row ${idx + 2}: ${emp.Name} has earnings but missing IFSC code`);
        }
        if (!emp['Bank Name']) {
          errs.push(`Row ${idx + 2}: ${emp.Name} has earnings but missing bank name`);
        }
      }
    });
    return errs;
  };

  // Handle monthly payroll file upload
  const handleMonthlyUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const employees = parseExcelData(text);
      const validationErrors = validateEmployeeData(employees, false);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setPaymentBatch({...paymentBatch, monthly: employees});
      setErrors([]);
    } catch (error) {
      setErrors([`Error reading monthly file: ${error.message}`]);
    }
  };

  // Handle weekly payroll file upload
  const handleWeeklyUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const employees = parseExcelData(text);
      const validationErrors = validateEmployeeData(employees, true);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      setPaymentBatch({...paymentBatch, weekly: employees});
      setErrors([]);
    } catch (error) {
      setErrors([`Error reading weekly file: ${error.message}`]);
    }
  };

  // Add manual payment to batch
  const addManualPayment = () => {
    const { type, payeeName, amount, bankName, ifsc, accountNo, branchName, narration } = manualPaymentForm;
    
    if (!payeeName || !amount || !bankName || !ifsc || !accountNo) {
      setErrors(['Please fill in all required fields (marked with *)']);
      return;
    }
    
    const payment = {
      type,
      payeeName,
      amount: parseFloat(amount),
      bankName,
      ifsc: ifsc.toUpperCase(),
      accountNo,
      branchName,
      narration: narration || `${type} payment to ${payeeName}`
    };
    
    setPaymentBatch({
      ...paymentBatch,
      manual: [...paymentBatch.manual, payment]
    });
    
    // Reset form
    setManualPaymentForm({
      type: 'Advance',
      payeeName: '',
      amount: '',
      bankName: '',
      ifsc: '',
      accountNo: '',
      branchName: '',
      narration: ''
    });
    setErrors([]);
  };

  // Remove manual payment from batch
  const removeManualPayment = (index) => {
    const newManual = paymentBatch.manual.filter((_, i) => i !== index);
    setPaymentBatch({...paymentBatch, manual: newManual});
  };

  // Clear a section of the batch
  const clearSection = (section) => {
    setPaymentBatch({...paymentBatch, [section]: section === 'manual' ? [] : null});
  };

  // Calculate batch summary
  const calculateBatchSummary = () => {
    let totalAmount = 0;
    let totalPayees = 0;
    
    // Monthly payroll
    if (paymentBatch.monthly) {
      paymentBatch.monthly.forEach(emp => {
        const amount = parseFloat(emp['Take Home'] || 0);
        if (amount > 0) {
          totalAmount += amount;
          totalPayees++;
        }
      });
    }
    
    // Weekly payroll
    if (paymentBatch.weekly) {
      paymentBatch.weekly.forEach(emp => {
        const amount = parseFloat(emp['Gross Pay'] || 0);
        if (amount > 0) {
          totalAmount += amount;
          totalPayees++;
        }
      });
    }
    
    // Manual payments
    paymentBatch.manual.forEach(payment => {
      const paymentConfig = CONFIG.manualPayments[payment.type];
      const netAmount = payment.amount * (1 - paymentConfig.rate);
      totalAmount += netAmount;
      totalPayees++;
    });
    
    return { totalAmount: totalAmount.toFixed(2), totalPayees };
  };

  // Generate consolidated Kotak Bank file
  const generateConsolidatedBankFile = () => {
    const rows = [];
    const today = formatDate();
    
    // Process monthly payroll
    if (paymentBatch.monthly) {
      paymentBatch.monthly.forEach(emp => {
        const amount = parseFloat(emp['Take Home'] || 0);
        if (amount > 0) {
          const ifsc = emp['IFSC Code'] || '';
          const transferType = ifsc.startsWith('KKBK') ? 'IFT' : 'NEFT';
          
          rows.push([
            'ONC24', 'VPAY', transferType, ' ', today, ' ',
            CONFIG.companyAccount, amount.toFixed(2), 'M', ' ',
            emp.Name || '', ' ', ifsc, emp['Bank Account No'] || '',
            ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', emp.Name || ''
          ].join(','));
        }
      });
    }
    
    // Process weekly payroll
    if (paymentBatch.weekly) {
      paymentBatch.weekly.forEach(emp => {
        const amount = parseFloat(emp['Gross Pay'] || 0);
        if (amount > 0) {
          const ifsc = emp['IFSC Code'] || '';
          const transferType = ifsc.startsWith('KKBK') ? 'IFT' : 'NEFT';
          
          rows.push([
            'ONC24', 'VPAY', transferType, ' ', today, ' ',
            CONFIG.companyAccount, amount.toFixed(2), 'M', ' ',
            emp.Name || '', ' ', ifsc, emp['Bank Account No'] || '',
            ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', emp.Name || ''
          ].join(','));
        }
      });
    }
    
    // Process manual payments
    paymentBatch.manual.forEach(payment => {
      const paymentConfig = CONFIG.manualPayments[payment.type];
      const netAmount = payment.amount * (1 - paymentConfig.rate);
      const transferType = payment.ifsc.startsWith('KKBK') ? 'IFT' : 'NEFT';
      
      rows.push([
        'ONC24', 'VPAY', transferType, ' ', today, ' ',
        CONFIG.companyAccount, netAmount.toFixed(2), 'M', ' ',
        payment.payeeName, ' ', payment.ifsc, payment.accountNo,
        ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', payment.payeeName
      ].join(','));
    });
    
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `OnCloud_Bank_Upload_${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate consolidated Tally Journal file
  const generateConsolidatedTallyFile = () => {
    const journals = [];
    const today = formatDate();
    let journalIndex = 1;
    
    // Process monthly payroll
    if (paymentBatch.monthly) {
      paymentBatch.monthly.forEach((emp) => {
        const grossEarnings = parseFloat(emp['Gross Earnings'] || 0);
        const otherEarnings = parseFloat(emp['Other Earnings'] || 0);
        const overtime = parseFloat(emp['Overtime'] || 0);
        const extras = parseFloat(emp['Extras'] || 0);
        const esi = parseFloat(emp['ESIC'] || 0);
        const loan = parseFloat(emp['Loan & Advance'] || 0);
        const penalties = parseFloat(emp['Penalities'] || 0);
        
        // Calculate the employee's net amount (what they should receive)
        // Total Credits (earnings) - Total Debits (deductions)
        const employeeNetAmount = grossEarnings + otherEarnings + overtime + extras - esi - loan - penalties;
        
        // Only create journal entry if there's any activity
        if (grossEarnings > 0 || otherEarnings > 0 || overtime > 0 || extras > 0 || employeeNetAmount !== 0) {
          const journalNo = generateJournalNumber('PAYMON', journalIndex);
          const refNo = generateJournalNumber('REFMON', journalIndex);
          journalIndex++;
          
          if (grossEarnings > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.salary, 'Dr/Cr': 'Dr',
              'Amount': grossEarnings.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (otherEarnings > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.otherEarnings, 'Dr/Cr': 'Dr',
              'Amount': otherEarnings.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (overtime > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.overtime, 'Dr/Cr': 'Dr',
              'Amount': overtime.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (extras > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.extraPay, 'Dr/Cr': 'Dr',
              'Amount': extras.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (esi > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.esi, 'Dr/Cr': 'Cr',
              'Amount': esi.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (loan > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.loan, 'Dr/Cr': 'Cr',
              'Amount': loan.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          if (penalties > 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': CONFIG.ledgers.penalties, 'Dr/Cr': 'Cr',
              'Amount': penalties.toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
          
          // Always add the employee credit/debit line to balance the journal
          if (employeeNetAmount !== 0) {
            journals.push({
              'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
              'Particulars': emp.Name, 'Dr/Cr': employeeNetAmount > 0 ? 'Cr' : 'Dr',
              'Amount': Math.abs(employeeNetAmount).toFixed(2), 'Narration': CONFIG.narrations.monthly
            });
          }
        }
      });
    }
    
    // Process weekly payroll
    if (paymentBatch.weekly) {
      paymentBatch.weekly.forEach((emp) => {
        const grossPay = parseFloat(emp['Gross Pay'] || 0);
        if (grossPay > 0) {
          const journalNo = generateJournalNumber('PAYWEEK', journalIndex);
          const refNo = generateJournalNumber('REFWEEK', journalIndex);
          journalIndex++;
          
          journals.push({
            'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
            'Particulars': CONFIG.ledgers.wages, 'Dr/Cr': 'Dr',
            'Amount': grossPay.toFixed(2), 'Narration': CONFIG.narrations.weekly
          });
          
          journals.push({
            'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
            'Particulars': emp.Name, 'Dr/Cr': 'Cr',
            'Amount': grossPay.toFixed(2), 'Narration': CONFIG.narrations.weekly
          });
        }
      });
    }
    
    // Process manual payments
    paymentBatch.manual.forEach((payment) => {
      const paymentConfig = CONFIG.manualPayments[payment.type];
      const grossAmount = payment.amount;
      const tdsAmount = grossAmount * paymentConfig.rate;
      const netAmount = grossAmount - tdsAmount;
      
      const journalNo = generateJournalNumber('MANUAL', journalIndex);
      const refNo = generateJournalNumber('REFMAN', journalIndex);
      journalIndex++;
      
      let drLedger = paymentConfig.dr.replace('[Payee]', payment.payeeName);
      
      journals.push({
        'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
        'Particulars': drLedger, 'Dr/Cr': 'Dr',
        'Amount': grossAmount.toFixed(2), 'Narration': payment.narration
      });
      
      if (paymentConfig.tds && tdsAmount > 0) {
        journals.push({
          'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
          'Particulars': paymentConfig.tds, 'Dr/Cr': 'Cr',
          'Amount': tdsAmount.toFixed(2), 'Narration': payment.narration
        });
      }
      
      journals.push({
        'Journal No': journalNo, 'Reference No': refNo, 'Date': today, 'Cost center': '',
        'Particulars': payment.payeeName, 'Dr/Cr': 'Cr',
        'Amount': netAmount.toFixed(2), 'Narration': payment.narration
      });
    });
    
    const headers = ['Journal No', 'Reference No', 'Date', 'Cost center', 'Particulars', 'Dr/Cr', 'Amount', 'Narration'];
    const csv = [
      headers.join(','),
      ...journals.map(j => headers.map(h => `"${j[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    a.download = `OnCloud_Tally_Journal_${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const goHome = () => {
    setCurrentView('home');
    setPaymentBatch({ monthly: null, weekly: null, manual: [] });
    setErrors([]);
  };

  const batchSummary = calculateBatchSummary();
  const hasBatchData = paymentBatch.monthly || paymentBatch.weekly || paymentBatch.manual.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{CONFIG.companyName} Payroll</h1>
              <p className="text-gray-600 mt-1">Consolidated Batch Payment Processing</p>
            </div>
            {currentView !== 'home' && (
              <button onClick={goHome} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <Home size={20} />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>

        {/* Home View */}
        {currentView === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Consolidated Payment Batch Processing</h2>
                <p className="text-gray-600">Process all your payments together in one go - monthly payroll, weekly payroll, and manual expenses</p>
              </div>
              <button
                onClick={() => setCurrentView('batch')}
                className="w-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition text-xl font-semibold shadow-lg"
              >
                <Plus size={32} />
                Start New Payment Batch
              </button>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <List size={20} />
                How Consolidated Processing Works
              </h3>
              <ol className="space-y-2 text-blue-800">
                <li className="flex gap-2"><span className="font-bold">1.</span><span>Upload your monthly payroll CSV file from PetPooja (if you have monthly employees to pay)</span></li>
                <li className="flex gap-2"><span className="font-bold">2.</span><span>Upload your weekly payroll CSV file from PetPooja (if you have weekly workers to pay)</span></li>
                <li className="flex gap-2"><span className="font-bold">3.</span><span>Add manual payments like rent, contractor charges, advances one by one to the batch</span></li>
                <li className="flex gap-2"><span className="font-bold">4.</span><span>Review the complete batch summary to verify total payout amount</span></li>
                <li className="flex gap-2"><span className="font-bold">5.</span><span>Generate ONE consolidated bank file and ONE consolidated Tally file containing everything</span></li>
                <li className="flex gap-2"><span className="font-bold">6.</span><span>Upload both files to your bank and Tally - done in one go!</span></li>
              </ol>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-900 mb-3">✅ CSV Files Now Supported!</h3>
              <p className="text-green-800">This application now correctly reads CSV files exported from PetPooja. No more "0 employees" errors!</p>
            </div>
          </div>
        )}

        {/* Batch Processing View */}
        {currentView === 'batch' && (
          <div className="space-y-6">
            {/* Batch Summary Card */}
            {hasBatchData && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Current Batch Summary</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-100 text-sm">Total Payees in Batch</p>
                    <p className="text-4xl font-bold">{batchSummary.totalPayees}</p>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Total Payout Amount</p>
                    <p className="text-4xl font-bold">₹{batchSummary.totalAmount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-red-800 mb-2">Errors Found</h3>
                    <ul className="list-disc list-inside text-red-700 space-y-1">
                      {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Payroll Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Monthly Payroll</h3>
                    <p className="text-sm text-gray-600">Upload your monthly wages CSV file</p>
                  </div>
                </div>
                {paymentBatch.monthly && (
                  <button
                    onClick={() => clearSection('monthly')}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                )}
              </div>
              
              {!paymentBatch.monthly ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleMonthlyUpload}
                    className="hidden"
                    id="monthly-upload"
                  />
                  <label
                    htmlFor="monthly-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
                  >
                    <Upload size={20} />
                    Upload Monthly File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">CSV file from PetPooja</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">Monthly payroll loaded successfully</span>
                  </div>
                  <p className="text-green-700">
                    {paymentBatch.monthly.filter(emp => parseFloat(emp['Take Home'] || 0) > 0).length} employees with total ₹
                    {paymentBatch.monthly.reduce((sum, emp) => sum + Math.max(0, parseFloat(emp['Take Home'] || 0)), 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Weekly Payroll Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Weekly Payroll</h3>
                    <p className="text-sm text-gray-600">Upload your weekly wages CSV file</p>
                  </div>
                </div>
                {paymentBatch.weekly && (
                  <button
                    onClick={() => clearSection('weekly')}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                )}
              </div>
              
              {!paymentBatch.weekly ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleWeeklyUpload}
                    className="hidden"
                    id="weekly-upload"
                  />
                  <label
                    htmlFor="weekly-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition"
                  >
                    <Upload size={20} />
                    Upload Weekly File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">CSV file from PetPooja</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">Weekly payroll loaded successfully</span>
                  </div>
                  <p className="text-green-700">
                    {paymentBatch.weekly.filter(emp => parseFloat(emp['Gross Pay'] || 0) > 0).length} employees with total ₹
                    {paymentBatch.weekly.reduce((sum, emp) => sum + Math.max(0, parseFloat(emp['Gross Pay'] || 0)), 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Manual Payments Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <DollarSign size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Manual Payments</h3>
                    <p className="text-sm text-gray-600">Add rent, advances, contractor charges, etc.</p>
                  </div>
                </div>
                {paymentBatch.manual.length > 0 && (
                  <button
                    onClick={() => clearSection('manual')}
                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                )}
              </div>

              {/* Manual Payment Form */}
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={manualPaymentForm.type}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {Object.keys(CONFIG.manualPayments).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {CONFIG.manualPayments[manualPaymentForm.type].tds && (
                      <p className="text-xs text-blue-600 mt-1">
                        TDS {(CONFIG.manualPayments[manualPaymentForm.type].rate * 100)}% → {CONFIG.manualPayments[manualPaymentForm.type].tds}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payee Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualPaymentForm.payeeName}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, payeeName: e.target.value})}
                      placeholder="Enter payee name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gross Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={manualPaymentForm.amount}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, amount: e.target.value})}
                      placeholder="Amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {manualPaymentForm.amount && CONFIG.manualPayments[manualPaymentForm.type].tds && (
                      <p className="text-xs text-gray-600 mt-1">
                        Net: ₹{(parseFloat(manualPaymentForm.amount) * (1 - CONFIG.manualPayments[manualPaymentForm.type].rate)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualPaymentForm.ifsc}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, ifsc: e.target.value.toUpperCase()})}
                      placeholder="IFSC"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualPaymentForm.accountNo}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, accountNo: e.target.value})}
                      placeholder="Account No"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={manualPaymentForm.bankName}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, bankName: e.target.value})}
                      placeholder="Bank name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Narration / Notes
                    </label>
                    <input
                      type="text"
                      value={manualPaymentForm.narration}
                      onChange={(e) => setManualPaymentForm({...manualPaymentForm, narration: e.target.value})}
                      placeholder="Payment description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={addManualPayment}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  <Plus size={20} />
                  Add to Batch
                </button>
              </div>

              {/* Manual Payments List */}
              {paymentBatch.manual.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Manual Payments in Batch ({paymentBatch.manual.length})</h4>
                  <div className="space-y-2">
                    {paymentBatch.manual.map((payment, idx) => {
                      const config = CONFIG.manualPayments[payment.type];
                      const netAmount = payment.amount * (1 - config.rate);
                      return (
                        <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-purple-900">{payment.payeeName}</span>
                              <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">{payment.type}</span>
                            </div>
                            <p className="text-sm text-purple-700">
                              Gross: ₹{payment.amount.toFixed(2)} 
                              {config.tds && ` | TDS: ₹${(payment.amount * config.rate).toFixed(2)}`}
                              {' '}| Net: ₹{netAmount.toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeManualPayment(idx)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Files Section */}
            {hasBatchData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Generate Consolidated Files</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-900 font-semibold mb-2">Ready to generate files for:</p>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    {paymentBatch.monthly && <li>✓ {paymentBatch.monthly.filter(e => parseFloat(e['Take Home'] || 0) > 0).length} monthly employees</li>}
                    {paymentBatch.weekly && <li>✓ {paymentBatch.weekly.filter(e => parseFloat(e['Gross Pay'] || 0) > 0).length} weekly employees</li>}
                    {paymentBatch.manual.length > 0 && <li>✓ {paymentBatch.manual.length} manual payments</li>}
                    <li className="font-bold text-blue-900 mt-2">Total: {batchSummary.totalPayees} payees | ₹{batchSummary.totalAmount}</li>
                  </ul>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={generateConsolidatedBankFile}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
                  >
                    <Download size={24} />
                    Generate Bank File
                  </button>
                  <button
                    onClick={generateConsolidatedTallyFile}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
                  >
                    <Download size={24} />
                    Generate Tally File
                  </button>
                </div>

                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside text-green-800 space-y-1 text-sm">
                    <li>Click both buttons above to download the consolidated files</li>
                    <li>Upload the bank file to your Kotak payment portal</li>
                    <li>Upload the Tally file to your accounting system via Suvit.io</li>
                    <li>All {batchSummary.totalPayees} payments will be processed together!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>{CONFIG.companyName} Payroll Processing System v2.0 | All data processed locally in your browser</p>
          <p className="mt-1">Support: <a href={`mailto:${CONFIG.supportEmail}`} className="text-blue-600 hover:underline">{CONFIG.supportEmail}</a></p>
        </div>
      </div>
    </div>
  );
}

export default App;