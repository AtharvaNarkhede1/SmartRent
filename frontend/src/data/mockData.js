// No dummy data here.
export const initialProperties = [];
export const initialRooms = [];
export const initialTenants = [];
export const initialRentLedger = [];
export const initialReminders = [];
export const initialBookings = [];
export const initialMaintenance = [];
export const initialReceipts = [];
export const initialTransactions = [];
export const recentActivities = [];
export const monthlyRentCollectionChart = [];
export const occupancyTrendChart = [];
export const expenseBreakdown = [];
export const propertyPerformanceData = [];

export const defaultSettings = {
  accountHolder: '',
  upiId: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  paymentInstructions: 'Please include your Room Number in UPI transaction remarks and share screenshot on WhatsApp.',
  autoReminderEnabled: true,
  daysBeforeDue: [1, 3, 5],
  sendOverdueReminder: true,
  whatsappEnabled: true,
  smsEnabled: false,
  emailEnabled: false,
  currency: 'INR',
  currencySymbol: '₹',
  appName: 'SmartRent Operations',
  qrCodeImage: null
};

export const initialOwnerProfile = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  city: '',
  bio: '',
  profilePhoto: null,
  role: 'Property Owner',
  numProperties: 0,
  yearsInBusiness: 1
};
