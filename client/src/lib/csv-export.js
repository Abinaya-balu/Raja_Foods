/**
 * Utility functions for generating and downloading CSV reports
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of column headers
 * @param {Object} fieldMap - Mapping of data fields to header columns
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, headers, fieldMap) => {
  if (!data || !data.length) return '';
  
  // Add header row
  let csvContent = headers.join(',') + '\n';
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const field = fieldMap[header];
      let value = '';
      
      if (typeof field === 'function') {
        value = field(item);
      } else if (field.includes('.')) {
        // Handle nested properties like "customer.name"
        const props = field.split('.');
        let propValue = item;
        for (const prop of props) {
          propValue = propValue ? propValue[prop] : '';
        }
        value = propValue;
      } else {
        value = item[field] || '';
      }
      
      // Escape quotes and wrap in quotes if value contains comma or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }
      
      return value;
    }).join(',');
    
    csvContent += row + '\n';
  });
  
  return csvContent;
};

/**
 * Download data as a CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} fileName - Name of the file to download
 */
export const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate and download order reports
 * @param {Array} orders - Array of order objects
 */
export const generateOrderReport = (orders) => {
  const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Status', 'Total Amount', 'Products'];
  
  const fieldMap = {
    'Order ID': '_id',
    'Customer': order => order.userId?.userName || 'Unknown',
    'Email': order => order.userId?.email || 'N/A',
    'Date': order => order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A',
    'Status': 'orderStatus',
    'Total Amount': order => `₹${order.totalAmount || 0}`,
    'Products': order => {
      if (!order.orderItems || !order.orderItems.length) return '';
      return order.orderItems.map(item => 
        `${item.productId?.name || 'Product'} (${item.quantity})`
      ).join('; ');
    }
  };
  
  const csvContent = convertToCSV(orders, headers, fieldMap);
  downloadCSV(csvContent, `order-report-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate and download booking reports
 * @param {Array} bookings - Array of booking objects
 */
export const generateBookingReport = (bookings) => {
  const headers = ['Booking ID', 'Customer', 'Email', 'Date', 'Time Slot', 'Status', 'Notes'];
  
  const fieldMap = {
    'Booking ID': '_id',
    'Customer': booking => booking.customerId?.userName || 'Unknown',
    'Email': booking => booking.customerId?.email || 'N/A',
    'Date': booking => booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A',
    'Time Slot': 'timeSlot',
    'Status': 'status',
    'Notes': 'notes'
  };
  
  const csvContent = convertToCSV(bookings, headers, fieldMap);
  downloadCSV(csvContent, `booking-report-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate and download user reports
 * @param {Array} users - Array of user objects
 */
export const generateUserReport = (users) => {
  const headers = ['User ID', 'Name', 'Email', 'Role', 'Registration Date'];
  
  const fieldMap = {
    'User ID': '_id',
    'Name': 'userName',
    'Email': 'email',
    'Role': 'role',
    'Registration Date': user => user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
  };
  
  const csvContent = convertToCSV(users, headers, fieldMap);
  downloadCSV(csvContent, `user-report-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate and download review reports
 * @param {Array} reviews - Array of review objects
 * @param {string} reportType - Type of report to generate ('all', 'positive', 'negative')
 */
export const generateReviewReport = (reviews, reportType = 'all') => {
  // Define report file name based on type
  let reportName;
  switch (reportType) {
    case 'positive':
      reportName = 'positive-reviews';
      break;
    case 'negative':
      reportName = 'negative-reviews';
      break;
    default:
      reportName = 'all-reviews';
  }
  
  const headers = ['Review ID', 'Product', 'Customer', 'Rating', 'Feedback', 'Date'];
  
  const fieldMap = {
    'Review ID': '_id',
    'Product': review => review.productTitle || 'Unknown Product',
    'Customer': 'userName',
    'Rating': 'reviewValue',
    'Feedback': 'reviewMessage',
    'Date': review => review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'
  };
  
  const csvContent = convertToCSV(reviews, headers, fieldMap);
  downloadCSV(csvContent, `${reportName}-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate and download product reports
 * @param {Array} products - Array of product objects
 * @param {Array} orders - Array of order objects for sales analysis
 * @param {string} reportType - Type of report to generate ('inventory', 'sales', 'analytics')
 * @param {string} timeFrame - Time frame for the report ('week', 'month', 'all')
 */
export const generateProductReport = (products, orders = [], reportType = 'inventory', timeFrame = 'all') => {
  if (!products || !products.length) return;

  switch (reportType) {
    case 'sales':
      generateProductSalesReport(products, orders, timeFrame);
      break;
    case 'analytics':
      generateProductAnalyticsReport(products, orders, timeFrame);
      break;
    case 'inventory':
    default:
      generateProductInventoryReport(products);
      break;
  }
};

/**
 * Generate inventory report for products
 * @param {Array} products - Array of product objects
 */
const generateProductInventoryReport = (products) => {
  const headers = ['Product ID', 'Title', 'Category', 'Type', 'Price', 'Sale Price', 'Stock', 'Average Rating'];
  
  const fieldMap = {
    'Product ID': '_id',
    'Title': 'title',
    'Category': 'category',
    'Type': 'type',
    'Price': product => `₹${product.price || 0}`,
    'Sale Price': product => product.salePrice ? `₹${product.salePrice}` : 'N/A',
    'Stock': 'totalStock',
    'Average Rating': product => product.averageReview ? product.averageReview.toFixed(1) : 'No ratings'
  };
  
  const csvContent = convertToCSV(products, headers, fieldMap);
  downloadCSV(csvContent, `product-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate sales report for products
 * @param {Array} products - Array of product objects
 * @param {Array} orders - Array of order objects
 * @param {string} timeFrame - Time frame for the report
 */
const generateProductSalesReport = (products, orders, timeFrame) => {
  // Filter orders by timeframe
  const filteredOrders = filterOrdersByTimeFrame(orders, timeFrame);
  
  // Create a map of product sales data
  const productSalesMap = new Map();
  
  // Initialize all products with zero sales
  products.forEach(product => {
    productSalesMap.set(product._id, {
      productId: product._id,
      title: product.title,
      category: product.category,
      type: product.type,
      price: product.price,
      salePrice: product.salePrice,
      quantitySold: 0,
      totalRevenue: 0
    });
  });
  
  // Calculate sales for each product
  filteredOrders.forEach(order => {
    if (order.orderItems && order.orderItems.length) {
      order.orderItems.forEach(item => {
        if (item.productId && productSalesMap.has(item.productId._id)) {
          const productData = productSalesMap.get(item.productId._id);
          const price = item.price || item.productId.price || 0;
          
          productData.quantitySold += item.quantity || 0;
          productData.totalRevenue += (price * (item.quantity || 0));
          
          productSalesMap.set(item.productId._id, productData);
        }
      });
    }
  });
  
  // Convert map to array and sort by quantity sold
  const salesData = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantitySold - a.quantitySold);
  
  const headers = ['Product ID', 'Title', 'Category', 'Type', 'Price', 'Quantity Sold', 'Total Revenue'];
  
  const fieldMap = {
    'Product ID': 'productId',
    'Title': 'title',
    'Category': 'category',
    'Type': 'type',
    'Price': item => `₹${item.price || 0}`,
    'Quantity Sold': 'quantitySold',
    'Total Revenue': item => `₹${item.totalRevenue.toFixed(2)}`
  };
  
  const csvContent = convertToCSV(salesData, headers, fieldMap);
  downloadCSV(csvContent, `product-sales-${timeFrame}-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Generate analytics report for products showing most popular products
 * @param {Array} products - Array of product objects
 * @param {Array} orders - Array of order objects
 * @param {string} timeFrame - Time frame for the report
 */
const generateProductAnalyticsReport = (products, orders, timeFrame) => {
  // Filter orders by timeframe
  const filteredOrders = filterOrdersByTimeFrame(orders, timeFrame);
  
  // Create maps for products
  const productSalesMap = new Map();
  const productViewsMap = new Map();
  
  // Initialize all products with zero sales and views
  products.forEach(product => {
    productSalesMap.set(product._id, {
      productId: product._id,
      title: product.title,
      category: product.category,
      type: product.type,
      price: product.price,
      quantitySold: 0,
      totalRevenue: 0,
      views: product.views || 0,
      averageReview: product.averageReview || 0
    });
  });
  
  // Calculate sales for each product
  filteredOrders.forEach(order => {
    if (order.orderItems && order.orderItems.length) {
      order.orderItems.forEach(item => {
        if (item.productId && productSalesMap.has(item.productId._id)) {
          const productData = productSalesMap.get(item.productId._id);
          const price = item.price || item.productId.price || 0;
          
          productData.quantitySold += item.quantity || 0;
          productData.totalRevenue += (price * (item.quantity || 0));
          
          productSalesMap.set(item.productId._id, productData);
        }
      });
    }
  });
  
  // Convert map to array and calculate popularity score (combination of sales, views, and ratings)
  const analyticsData = Array.from(productSalesMap.values())
    .map(product => ({
      ...product,
      popularityScore: (product.quantitySold * 3) + (product.views * 0.1) + (product.averageReview * 5)
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore);
  
  const headers = [
    'Product ID', 
    'Title', 
    'Category', 
    'Type', 
    'Quantity Sold', 
    'Total Revenue', 
    'Views', 
    'Average Rating', 
    'Popularity Score'
  ];
  
  const fieldMap = {
    'Product ID': 'productId',
    'Title': 'title',
    'Category': 'category',
    'Type': 'type',
    'Quantity Sold': 'quantitySold',
    'Total Revenue': item => `₹${item.totalRevenue.toFixed(2)}`,
    'Views': 'views',
    'Average Rating': item => item.averageReview ? item.averageReview.toFixed(1) : 'No ratings',
    'Popularity Score': item => item.popularityScore.toFixed(0)
  };
  
  const csvContent = convertToCSV(analyticsData, headers, fieldMap);
  downloadCSV(csvContent, `product-analytics-${timeFrame}-${new Date().toISOString().slice(0, 10)}.csv`);
};

/**
 * Filter orders by time frame
 * @param {Array} orders - Array of order objects
 * @param {string} timeFrame - Time frame to filter by
 * @returns {Array} Filtered orders
 */
const filterOrdersByTimeFrame = (orders, timeFrame) => {
  if (!orders || !orders.length || timeFrame === 'all') return orders;
  
  const now = new Date();
  let startDate;
  
  switch (timeFrame) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      return orders;
  }
  
  return orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate >= startDate;
  });
}; 