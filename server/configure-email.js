const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Email provider configurations
const providers = {
  gmail: {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    instructions: [
      '1. Make sure 2-Step Verification is enabled in your Google account',
      '2. Generate an App Password at https://myaccount.google.com/apppasswords',
      '3. Use that App Password instead of your regular password'
    ]
  },
  outlook: {
    name: 'Outlook/Hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    instructions: [
      '1. Use your regular Outlook/Hotmail email and password',
      '2. If you have 2FA enabled, you\'ll need to create an app password'
    ]
  },
  yahoo: {
    name: 'Yahoo',
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
    instructions: [
      '1. Make sure 2-Step Verification is enabled in your Yahoo account',
      '2. Generate an app password in your Yahoo account security settings',
      '3. Use that app password instead of your regular password'
    ]
  },
  custom: {
    name: 'Custom SMTP',
    instructions: [
      'You\'ll need to provide your SMTP server details:',
      '- SMTP host (e.g., smtp.example.com)',
      '- SMTP port (e.g., 587 or 465)',
      '- Whether to use secure connection (SSL/TLS)',
      '- Username and password'
    ]
  }
};

// Function to update .env file
function updateEnvFile(config) {
  try {
    // Get path to the .env file
    const envPath = path.join(__dirname, '..', '.env');
    
    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      console.error(`Error: .env file not found at ${envPath}`);
      return false;
    }
    
    // Read the current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add each configuration setting
    Object.entries(config).forEach(([key, value]) => {
      const envVar = key.toUpperCase();
      
      if (envContent.includes(`${envVar}=`)) {
        // Replace existing value
        envContent = envContent.replace(
          new RegExp(`${envVar}=.*`, 'g'),
          `${envVar}=${value}`
        );
      } else {
        // Add new entry
        envContent += `\n${envVar}=${value}`;
      }
    });
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\nSuccess! Your email configuration has been updated in the .env file.');
    return true;
  } catch (error) {
    console.error('An error occurred while updating the .env file:', error);
    return false;
  }
}

// Display menu of providers
console.log('=== Email Provider Configuration Utility ===');
console.log('Choose an email provider to configure:');
Object.entries(providers).forEach(([key, provider], index) => {
  console.log(`${index + 1}. ${provider.name}`);
});

// Get provider choice
rl.question('\nEnter your choice (1-4): ', (choice) => {
  const providerKeys = Object.keys(providers);
  const selectedIndex = parseInt(choice, 10) - 1;
  
  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= providerKeys.length) {
    console.error('Invalid choice. Please restart the script and try again.');
    rl.close();
    return;
  }
  
  const selectedProvider = providerKeys[selectedIndex];
  const provider = providers[selectedProvider];
  
  console.log(`\nConfiguring ${provider.name}:`);
  provider.instructions.forEach(instruction => console.log(instruction));
  
  // Configuration workflow based on provider
  if (selectedProvider === 'custom') {
    // Custom SMTP configuration
    const customConfig = {};
    
    rl.question('\nSMTP Host: ', (host) => {
      customConfig.SMTP_HOST = host;
      
      rl.question('SMTP Port: ', (port) => {
        customConfig.SMTP_PORT = port;
        
        rl.question('Use Secure Connection? (yes/no): ', (secure) => {
          customConfig.SMTP_SECURE = secure.toLowerCase() === 'yes' ? 'true' : 'false';
          
          rl.question('SMTP Username: ', (username) => {
            customConfig.SMTP_USER = username;
            customConfig.EMAIL_USER = username;
            
            rl.question('SMTP Password: ', (password) => {
              customConfig.SMTP_PASS = password;
              customConfig.EMAIL_PASS = password;
              
              // Update .env file
              updateEnvFile(customConfig);
              console.log('You can now run test-email.js to verify your configuration.');
              rl.close();
            });
          });
        });
      });
    });
  } else {
    // Standard provider configuration
    const config = {
      SMTP_HOST: provider.host,
      SMTP_PORT: provider.port.toString(),
      SMTP_SECURE: provider.secure ? 'true' : 'false'
    };
    
    rl.question('\nEmail Address: ', (email) => {
      config.EMAIL_USER = email;
      config.SMTP_USER = email;
      
      rl.question('Password/App Password: ', (password) => {
        config.EMAIL_PASS = password;
        config.SMTP_PASS = password;
        
        // Update .env file
        if (updateEnvFile(config)) {
          console.log('You can now run test-email.js to verify your configuration.');
        }
        rl.close();
      });
    });
  }
}); 