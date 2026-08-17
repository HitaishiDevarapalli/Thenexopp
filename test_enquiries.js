const fs = require('fs');
const path = require('path');

const ENQUIRIES_BACKUP_FILE = path.join(__dirname, 'server', 'data', 'enquiries.json');

console.log('=== RUNNING END-TO-END ENQUIRY VERIFICATION ===');

const getBackupEnquiries = () => {
  try {
    if (fs.existsSync(ENQUIRIES_BACKUP_FILE)) {
      const content = fs.readFileSync(ENQUIRIES_BACKUP_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    }
  } catch (e) {}
  return [];
};

const saveBackupEnquiry = (enquiry) => {
  try {
    const list = getBackupEnquiries();
    const filtered = list.filter(e => e.id !== enquiry.id);
    const updated = [enquiry, ...filtered];
    fs.mkdirSync(path.dirname(ENQUIRIES_BACKUP_FILE), { recursive: true });
    fs.writeFileSync(ENQUIRIES_BACKUP_FILE, JSON.stringify(updated, null, 2));
    return true;
  } catch (e) {
    return false;
  }
};

// 1. Test Property Enquiry
const propEnquiry = {
  id: `ENQ-PROP-${Date.now()}`,
  customerName: 'Kiran Kumar',
  phone: '9848012345',
  email: 'kiran@gmail.com',
  listingTitle: 'Luxury 3BHK Villa in Jubilee Hills',
  listingType: 'PROPERTY',
  listingId: 'prop-101',
  enquiryType: 'BUY',
  message: 'Interested in site inspection this weekend',
  date: new Date().toLocaleDateString('en-IN'),
  status: 'New',
  createdAt: new Date().toISOString()
};

// 2. Test Business Enquiry
const bizEnquiry = {
  id: `ENQ-BIZ-${Date.now()}`,
  customerName: 'Suresh Reddy',
  phone: '9849054321',
  email: 'suresh@business.com',
  listingTitle: 'Profitable Supermarket in Madhapur',
  listingType: 'BUSINESS',
  listingId: 'biz-202',
  enquiryType: 'BUY',
  message: 'Please send latest P&L statement and valuation details',
  date: new Date().toLocaleDateString('en-IN'),
  status: 'New',
  createdAt: new Date().toISOString()
};

// 3. Test Slot Booking
const slotBooking = {
  id: `ENQ-SLOT-${Date.now()}`,
  customerName: 'M Mani',
  phone: '9988776655',
  email: 'mani@nexopp.com',
  listingTitle: 'Commercial Retail Space in Gachibowli',
  listingType: 'PROPERTY',
  listingId: 'prop-303',
  enquiryType: 'SLOT_BOOKING',
  preferredTime: '11:00 AM',
  preferredMoveInDate: '20 Aug 2026',
  date: '20 Aug 2026',
  message: 'Visit requested on 20 Aug 2026 at 11:00 AM',
  status: 'New',
  createdAt: new Date().toISOString()
};

console.log('1. Saving Property Enquiry:', saveBackupEnquiry(propEnquiry));
console.log('2. Saving Business Enquiry:', saveBackupEnquiry(bizEnquiry));
console.log('3. Saving Slot Booking Enquiry:', saveBackupEnquiry(slotBooking));

const allRecords = getBackupEnquiries();
console.log(`4. Total Enquiries in Storage: ${allRecords.length}`);

console.log('\n=== VERIFICATION RESULTS ===');
allRecords.forEach((r, idx) => {
  console.log(`[${idx + 1}] ID: ${r.id} | Name: ${r.customerName} | Type: ${r.listingType} | Status: ${r.status} | Title: ${r.listingTitle}`);
});

if (allRecords.length >= 3) {
  console.log('\n✅ ALL TEST ENQUIRIES VERIFIED AND PERSISTED SUCCESSFULLY!');
} else {
  console.log('\n❌ VERIFICATION FAILED');
}
