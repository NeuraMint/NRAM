const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Translation map for common Chinese comments to English
const translationMap = {
  // Page structure comments
  'State management': 'State management',
  'Service instances': 'Service instances',
  'Memory type interface': 'Memory type interface',
  'Sample data': 'Sample data',
  'Brand and copyright': 'Brand and copyright',
  'Links': 'Links',
  'Navigation links': 'Navigation links',
  'Navigation': 'Navigation',
  'Home': 'Home',
  'Marketplace': 'Marketplace',
  'Create Memory': 'Create Memory',
  'Validator Center': 'Validator Center',
  'Resource links': 'Resource links',
  'Resources': 'Resources',
  'Documentation': 'Documentation',
  'Help Center': 'Help Center',
  'Community links': 'Community links',
  'Community': 'Community',
  'Disclaimer': 'Disclaimer',
  
  // Interface related
  'Validation history interface': 'Validation history interface',
  'Validator ranking interface': 'Validator ranking interface',
  'Sort types': 'Sort types',
  'Filter interface': 'Filter interface',
  'Sample marketplace memory interface': 'Sample marketplace memory interface',
  'Memory marketplace page': 'Memory marketplace page',
  'Pending validation memory interface': 'Pending validation memory interface',
  'Memory NFT interface': 'Memory NFT interface',
  'Validator interface': 'Validator interface',
  'Validation record interface': 'Validation record interface',
  'Create validation request interface': 'Create validation request interface',
  'Memory type options': 'Memory type options',
  'Memory quality options': 'Memory quality options',
  'Sort options': 'Sort options',
  'Request body interface': 'Request body interface',
  'Response interface': 'Response interface',
  
  // Function related
  'Get memory NFTs from the blockchain marketplace': 'Get memory NFTs from the blockchain marketplace',
  'Note: This is a mock implementation, actual application needs to interact with the marketplace contract': 'Note: This is a mock implementation, actual application needs to interact with the marketplace contract',
  'In an actual application, this would call the marketplace contract to get listed NFTs': 'In an actual application, this would call the marketplace contract to get listed NFTs',
  'Currently using mock data': 'Currently using mock data',
  'Load validator state': 'Load validator state',
  'Check if user is a validator': 'Check if user is a validator',
  'If user is a validator, get validator statistics': 'If user is a validator, get validator statistics',
  'Load memories to be validated': 'Load memories to be validated',
  'Use standardized error handling': 'Use standardized error handling',
  'Return mock data when the actual API is unavailable': 'Return mock data when the actual API is unavailable',
  'In the actual implementation, this would call an API to upload images and data': 'In the actual implementation, this would call an API to upload images and data',
  'Since this is a simplified version, we return mock data directly': 'Since this is a simplified version, we return mock data directly',
  'Simulate network delay': 'Simulate network delay',
  'Simulate delay': 'Simulate delay',
  'Return mock validation records': 'Return mock validation records',
  'Mock validator data': 'Mock validator data',
  'Generate mock validation history': 'Generate mock validation history',
  'Mock validator leaderboard': 'Mock validator leaderboard',
  'Use memory MarketplaceHook': 'Use memory MarketplaceHook',
  'Handle memory purchase': 'Handle memory purchase',
  'Execute purchase logic': 'Execute purchase logic',
  'Refresh memory list': 'Refresh memory list',
  'Handle search': 'Handle search',
  'Handle price range filtering': 'Handle price range filtering',
  'Apply price filtering': 'Apply price filtering',
  'If already activated, cancel price filtering': 'If already activated, cancel price filtering',
  'Update filters for price range': 'Update filters for price range',
  'Render wallet connection prompt': 'Render wallet connection prompt',
  'Render memory list': 'Render memory list',
  
  // API related comments
  'Only accept POST requests': 'Only accept POST requests',
  'Parse request body': 'Parse request body',
  'Validate parameters': 'Validate parameters',
  'Validate price': 'Validate price',
  'Parse public key': 'Parse public key',
  'Initialize service': 'Initialize service',
  'Get memory information': 'Get memory information',
  'Verify ownership': 'Verify ownership',
  'Check if memory is transferable': 'Check if memory is transferable',
  'Check if memory is already listed': 'Check if memory is already listed',
  'This should query the Marketplace contract to confirm if the memory is already listed for sale': 'This should query the Marketplace contract to confirm if the memory is already listed for sale',
  'Execute listing transaction': 'Execute listing transaction',
  'If signature is provided, verify and submit': 'If signature is provided, verify and submit',
  'Otherwise, server builds transaction and sends': 'Otherwise, server builds transaction and sends',
  'Client signing mode': 'Client signing mode',
  'Verify signature and submit': 'Verify signature and submit',
  'The actual implementation would call the blockchain module to submit the transaction': 'The actual implementation would call the blockchain module to submit the transaction',
  'Server signing mode': 'Server signing mode',
  'Build and sign transaction': 'Build and sign transaction',
  'Simulate transaction process': 'Simulate transaction process',
  'This is just a simulation, an actual project should call the listing method of the Marketplace contract': 'This is just a simulation, an actual project should call the listing method of the Marketplace contract',
  'Get memory metadata': 'Get memory metadata',
  'Generate virtual listing ID': 'Generate virtual listing ID',
  'Return success response': 'Return success response',
  'Check if memory is for sale': 'Check if memory is for sale',
  'Check if price matches': 'Check if price matches',
  'Get seller information': 'Get seller information',
  'Execute transaction': 'Execute transaction',
  
  // Validate.tsx
  'Get the list of memories to be validated from the validation service': 'Get the list of memories to be validated from the validation service',
  'Load detailed information for each memory': 'Load detailed information for each memory',
  'Here we use IPFS or other storage services to get memory metadata': 'Here we use IPFS or other storage services to get memory metadata',
  'Simulate getting metadata; in a real project, it should be fetched from IPFS or Arweave': 'Simulate getting metadata; in a real project, it should be fetched from IPFS or Arweave',
  'Filter out memories that failed to load': 'Filter out memories that failed to load',
  'Helper function - randomly generate memory quality': 'Helper function - randomly generate memory quality',
  'Helper function - randomly generate memory type': 'Helper function - randomly generate memory type',
  'Helper function - randomly generate brain region': 'Helper function - randomly generate brain region',
  'Monitor wallet connection status': 'Monitor wallet connection status',
  'Submit validation results': 'Submit validation results',
  'Show loading state': 'Show loading state',
  'Create validation request': 'Create validation request',
  'Score greater than or equal to 50 is considered valid': 'Score greater than or equal to 50 is considered valid',
  'Submit validation': 'Submit validation',
  'Remove validated memory from the memory list': 'Remove validated memory from the memory list',
  'Reload validator state': 'Reload validator state',
  'Reset selection and score': 'Reset selection and score',
  'Refine error handling': 'Refine error handling',
  'Register as a validator': 'Register as a validator',
  'Minimum stake amount (1000 NRAM)': 'Minimum stake amount (1000 NRAM)',
  'Check if stake amount is sufficient': 'Check if stake amount is sufficient',
  'Register validator': 'Register validator',
  'Convert to lamports': 'Convert to lamports',
  'Claim validation rewards': 'Claim validation rewards',
  'Check if there are rewards to claim': 'Check if there are rewards to claim',
  'Call validation service to claim rewards': 'Call validation service to claim rewards',
  'Success prompt': 'Success prompt',
  'Memory selection': 'Memory selection',
  'Reset validation input': 'Reset validation input',
  'Quality color mapping': 'Quality color mapping',
  'Type icon mapping': 'Type icon mapping',
  'Emotion icon mapping': 'Emotion icon mapping',
  'Memory type icon mapping': 'Memory type icon mapping',
  'Format address': 'Format address',
  'Format date': 'Format date',
  'Validator requirements section': 'Validator requirements section',
  'Render memory card': 'Render memory card',
  'Validate memory details component': 'Validate memory details component',
  
  // ApiService.ts date comments
  'One record per day': 'One record per day',
  'The last two records are unprocessed': 'The last two records are unprocessed',
  'All processed records have rewards': 'All processed records have rewards',
  'Decreasing stake amount': 'Decreasing stake amount',
  'Initial reputation value': 'Initial reputation value',
  'One every 3 days': 'One every 3 days',
  'One out of every 3 is listed': 'One out of every 3 is listed',
  
  // Common error messages in code (not UI)
  'console.error(\'Error fetching marketplace items:\', error);': 'console.error(\'Error fetching marketplace items:\', error);',
  'console.error(\'Error loading validator state:\', error);': 'console.error(\'Error loading validator state:\', error);',
  'console.error(\'Error loading memories to validate:\', error);': 'console.error(\'Error loading memories to validate:\', error);',
  'console.error(\'Error submitting validation:\', error);': 'console.error(\'Error submitting validation:\', error);',
  'console.error(\'Error registering validator:\', error);': 'console.error(\'Error registering validator:\', error);',
  'console.error(\'Error claiming rewards:\', error);': 'console.error(\'Error claiming rewards:\', error);',
  'console.error(\'Error loading validation history:\', error);': 'console.error(\'Error loading validation history:\', error);',
  'console.error(\'Error loading validator rankings:\', error);': 'console.error(\'Error loading validator rankings:\', error);',
  'console.error(\'Error loading validator data:\', error);': 'console.error(\'Error loading validator data:\', error);',
  'console.error(\'Error claiming rewards:\', error);': 'console.error(\'Error claiming rewards:\', error);',

  // Request interface descriptions
  'memoryMint: string;       // Memory NFT mint address': 'memoryMint: string;       // Memory NFT mint address',
  'sellerPublicKey: string;  // Seller wallet address': 'sellerPublicKey: string;  // Seller wallet address',
  'price: number;            // Listing price': 'price: number;            // Listing price',
  'signature?: string;       // Signed transaction signature (optional, for client signing mode)': 'signature?: string;       // Signed transaction signature (optional, for client signing mode)',
  'buyerPublicKey: string;   // Buyer wallet address': 'buyerPublicKey: string;   // Buyer wallet address',
  
  // Other text strings - keep display text in Chinese
  'All rights reserved': 'All rights reserved', // Keep Chinese for UI: "All rights reserved"
  'NeuraMint is a decentralized memory NFT platform built on the Solana blockchain. All transactions are executed by smart contracts, and the platform is not responsible for user content and transactions.': 'NeuraMint is a decentralized memory NFT platform built on the Solana blockchain. All transactions are executed by smart contracts, and the platform is not responsible for user content and transactions.', // Keep Chinese for UI disclaimer
  
  // UI text and toast messages
  'Transform memories into digital assets on the Solana blockchain.': 'Transform memories into digital assets on the Solana blockchain.',
  'Mint': 'Mint',
  'Validate': 'Validate',
  'FAQ': 'FAQ',
  'Developers': 'Developers',
  'All rights reserved': 'All rights reserved',
  'Wallet not connected': 'Wallet not connected',
  'Network connection error, please check your internet connection': 'Network connection error, please check your internet connection',
  'Invalid wallet address': 'Invalid wallet address',
  'Unable to load validator information': 'Unable to load validator information',
  'Unable to load validator information: ': 'Unable to load validator information: ',
  'Memory #': 'Memory #',
  'This is a memory that needs validation, submitted by': 'This is a memory that needs validation, submitted by',
  'submitted': 'submitted',
  'Error loading memory details:': 'Error loading memory details:',
  'Unable to load memories to be validated': 'Unable to load memories to be validated',
  'Submitting validation...': 'Submitting validation...',
  'Validation submitted successfully!': 'Validation submitted successfully!',
  'Network connection error, please try again later': 'Network connection error, please try again later',
  'Insufficient balance to perform this operation': 'Insufficient balance to perform this operation',
  
  // Memory service related
  'Mint result interface': 'Mint result interface',
  'Transfer result interface': 'Transfer result interface',
  'Memory NFT service class - simplified version for interacting with memory NFT smart contracts': 'Memory NFT service class - simplified version for interacting with memory NFT smart contracts',
  'Initialize MintService': 'Initialize MintService',
  'Wallet state': 'Wallet state',
  'Mint new memory NFT': 'Mint new memory NFT',
  'Memory name': 'Memory name',
  'Memory description': 'Memory description',
  'Metadata URI': 'Metadata URI',
  'Is transferable': 'Is transferable',
  'Mint result': 'Mint result',
  
  // Footer text
  'NeuraMint is a decentralized memory NFT platform built on the Solana blockchain. All transactions are executed by smart contracts, and the platform is not responsible for user content and transactions.': 'NeuraMint is a decentralized memory NFT platform built on the Solana blockchain. All transactions are executed by smart contracts, and the platform is not responsible for user content and transactions.',
  
  // Validator related UI text
  'Unable to load validator information': 'Unable to load validator information',
  'Unable to load validator information: ': 'Unable to load validator information: ',
  'This is a memory that needs validation, submitted by': 'This is a memory that needs validation, submitted by',
  'Validation submitted successfully!': 'Validation submitted successfully!',
  'You are not a validator, cannot submit validation': 'You are not a validator, cannot submit validation',
  'Validation submission failed: ': 'Validation submission failed: ',
  'Validation submission failed, please try again': 'Validation submission failed, please try again',
  'Registering as validator...': 'Registering as validator...',
  'Stake amount must be at least': 'Stake amount must be at least',
  'Validator registration successful!': 'Validator registration successful!',
  'Your balance is insufficient to cover the stake amount and transaction fees': 'Your balance is insufficient to cover the stake amount and transaction fees',
  'Validator registration failed, please try again later': 'Validator registration failed, please try again later',
  'Validator registration failed: ': 'Validator registration failed: ',
  'Validator registration failed, please try again': 'Validator registration failed, please try again',
  
  // Error messages in code
  'Error fetching marketplace items:': 'Error fetching marketplace items:',
  'Error loading validator state:': 'Error loading validator state:',
  'Error loading memories to validate:': 'Error loading memories to validate:',
  'Error submitting validation:': 'Error submitting validation:',
  'Error registering validator:': 'Error registering validator:',
  'Error claiming rewards:': 'Error claiming rewards:',
  'Error loading validation history:': 'Error loading validation history:',
  'Error loading validator rankings:': 'Error loading validator rankings:',
  'Error loading validator data:': 'Error loading validator data:',
  'Error claiming rewards:': 'Error claiming rewards:',
  'Failed to mint memory NFT:': 'Failed to mint memory NFT:',
  'Failed to transfer memory:': 'Failed to transfer memory:',
  'Failed to set transferability:': 'Failed to set transferability:',
  'Unknown error': 'Unknown error',
  
  // Additional UI text
  'Submitting validation...': 'Submitting validation...',
  'Claiming rewards...': 'Claiming rewards...',
  'Rewards claimed successfully!': 'Rewards claimed successfully!',
  'Failed to claim rewards': 'Failed to claim rewards',
  'Insufficient balance to execute this transaction': 'Insufficient balance to execute this transaction',
  'Validator registration failed': 'Validator registration failed',
  'Failed to get validator statistics': 'Failed to get validator statistics',
  
  // Market page UI text
  'Price: Low to High': 'Price: Low to High',
  'Price: High to Low': 'Price: High to Low',
  'Quality: Low to High': 'Quality: Low to High',
  'Quality: High to Low': 'Quality: High to Low',
  'Newest Listings': 'Newest Listings',
  'Oldest Listings': 'Oldest Listings',
  'Please connect your wallet first': 'Please connect your wallet first',
  
  // Validate page UI text
  'No rewards to claim': 'No rewards to claim',
  'Failed to claim rewards, please try again later': 'Failed to claim rewards, please try again later',
  'You are not a validator, cannot claim rewards': 'You are not a validator, cannot claim rewards',
  'Failed to claim rewards, please try again': 'Failed to claim rewards, please try again',
  'Become a Memory Validator': 'Become a Memory Validator',
  'Validators are responsible for evaluating the authenticity and quality of memories. By staking NRAM tokens, you can participate in the validation process and earn rewards.': 'Validators are responsible for evaluating the authenticity and quality of memories. By staking NRAM tokens, you can participate in the validation process and earn rewards.',
  'Requirements': 'Requirements',
  'Minimum stake: 1000 NRAM': 'Minimum stake: 1000 NRAM',
  'Validation accuracy: at least 85%': 'Validation accuracy: at least 85%',
  'Activity: at least 10 validations per week': 'Activity: at least 10 validations per week',
  'Rewards': 'Rewards',
  'Each validation: 5-20 NRAM': 'Each validation: 5-20 NRAM',
  'Accuracy bonus: up to 10% additional rewards': 'Accuracy bonus: up to 10% additional rewards',
  'At least ': 'At least ',
  ' NRAM tokens required to become a validator': ' NRAM tokens required to become a validator',
  'You are already a validator': 'You are already a validator',
  
  // Fix double [Chinese UI text] issues
  '[Chinese UI text]': '[Chinese UI text]',
};

// Get a list of all files in the project
const getFiles = (dir, fileList = [], extensions = ['.ts', '.tsx', '.js', '.jsx']) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = getFiles(filePath, fileList, extensions);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
};

// Function to replace [Chinese UI text] markers with English equivalents
function replaceChineseUITextMarkers(content) {
  // Common UI text replacements
  const uiTextReplacements = {
    // Page titles
    '[Chinese UI text] 内存Marketplace | NeuraMint': 'Memory Marketplace | NeuraMint',
    '[Chinese UI text] NeuraMint - 记忆Marketplace': 'NeuraMint - Memory Marketplace',
    '[Chinese UI text] 记忆NFT平台': 'Memory NFT Platform',
    '[Chinese UI text] Mint记忆NFT | NeuraMint': 'Mint Memory NFT | NeuraMint',
    '[Chinese UI text] Validate记忆 | NeuraMint': 'Validate Memory | NeuraMint',
    '[Chinese UI text] Validate者仪表盘 | NeuraMint': 'Validator Dashboard | NeuraMint',
    '[Chinese UI text] 关于 NeuraMint | 记忆NFT平台': 'About NeuraMint | Memory NFT Platform',
    
    // Headers and titles
    '[Chinese UI text] 内存Marketplace': 'Memory Marketplace',
    '[Chinese UI text] 记忆Marketplace': 'Memory Marketplace',
    '[Chinese UI text] 筛选': 'Filter',
    '[Chinese UI text] 过滤器': 'Filters',
    '[Chinese UI text] 记忆类型': 'Memory Type',
    '[Chinese UI text] 记忆品质': 'Memory Quality',
    '[Chinese UI text] 价格范围 (SOL)': 'Price Range (SOL)',
    '[Chinese UI text] 最小': 'Min',
    '[Chinese UI text] 最大': 'Max',
    '[Chinese UI text] 排序方式': 'Sort By',
    
    // Validator dashboard
    '[Chinese UI text] Validate者仪表盘': 'Validator Dashboard',
    '[Chinese UI text] 查看您的Validate统计数据、历史记录和排名': 'View your validation statistics, history, and rankings',
    '[Chinese UI text] 总Validate数': 'Total Validations',
    '[Chinese UI text] 成功率': 'Success Rate',
    '[Chinese UI text] 总Rewards': 'Total Rewards',
    '[Chinese UI text] 待领取Rewards': 'Pending Rewards',
    '[Chinese UI text] 每日Validate活动': 'Daily Validation Activity',
    '[Chinese UI text] Validate结果分布': 'Validation Result Distribution',
    '[Chinese UI text] Validate者资料': 'Validator Profile',
    '[Chinese UI text] 钱包地址': 'Wallet Address',
    '[Chinese UI text] 质押金额': 'Staked Amount',
    '[Chinese UI text] Validate者状态': 'Validator Status',
    '[Chinese UI text] 声誉分数': 'Reputation Score',
    '[Chinese UI text] 本周Rewards': 'Weekly Rewards',
    '[Chinese UI text] 暂无Validate历史': 'No Validation History',
    '[Chinese UI text] Validate活动图表': 'Validation Activity Chart',
    '[Chinese UI text] Validate时间': 'Validation Time',
    '[Chinese UI text] Validate分数': 'Validation Score',
    '[Chinese UI text] 结果': 'Result',
    'Rewards': 'Rewards',
    '[Chinese UI text] 排名': 'Rank',
    '[Chinese UI text] Validate者': 'Validator',
    '[Chinese UI text] Validate数量': 'Validation Count',
    '[Chinese UI text] 声誉分数': 'Reputation Score',
    '[Chinese UI text] 您': 'You',
    '[Chinese UI text] 声誉排名对比': 'Reputation Ranking Comparison',
    
    // Messages
    '[Chinese UI text] 请连接您的钱包': 'Please Connect Your Wallet',
    '[Chinese UI text] 连接您的钱包以购买记忆NFT': 'Connect your wallet to buy memory NFTs',
    '[Chinese UI text] 没有找到符合条件的记忆': 'No memories found matching your criteria',
    '[Chinese UI text] 记忆购买成功！': 'Memory purchased successfully!',
    'Please connect your wallet first': 'Please connect your wallet first',
    '[Chinese UI text] 您还不是Validate者': 'You are not a validator yet',
    '[Chinese UI text] 加载Validate者数据失败': 'Failed to load validator data',
    '[Chinese UI text] 无法加载Validate历史': 'Failed to load validation history',
    '[Chinese UI text] 无法加载Validate者排名': 'Failed to load validator rankings',
    'Rewards claimed successfully!': 'Rewards claimed successfully!',
    '[Chinese UI text] Failed to claim rewards，请稍后再试': 'Failed to claim rewards, please try again later',
    'Failed to claim rewards, please try again': 'Failed to claim rewards, please try again',
    
    // Generic UI elements
    '[Chinese UI text] 打开主菜单': 'Open main menu',
    '[Chinese UI text]': '',
  };
  
  // Replace all occurrences of Chinese UI text markers
  Object.entries(uiTextReplacements).forEach(([chinese, english]) => {
    content = content.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
  });
  
  return content;
}

// Process a file to replace Chinese comments with English
const processFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace Chinese comments with English translations
    Object.entries(translationMap).forEach(([chinese, english]) => {
      content = content.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
    });
    
    // Fix double [Chinese UI text] markers
    content = content.replace(/\[Chinese UI text\] \[Chinese UI text\]/g, '[Chinese UI text]');
    
    // Replace [Chinese UI text] markers with English equivalents
    content = replaceChineseUITextMarkers(content);
    
    // Check if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Translated: ${filePath}`);
      
      // Log any remaining untranslated Chinese comments
      const remainingChinese = content.match(/\/\/\s*[\u4e00-\u9fa5]+/g);
      if (remainingChinese) {
        console.log(`Untranslated comments in ${filePath}:`, remainingChinese);
      }
      
      // Log any remaining [Chinese UI text] markers
      const remainingMarkers = content.match(/\[Chinese UI text\]/g);
      if (remainingMarkers) {
        console.log(`Remaining UI text markers in ${filePath}: ${remainingMarkers.length}`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = () => {
  const rootDir = __dirname;
  console.log(`Searching for files in: ${rootDir}`);
  
  const files = getFiles(rootDir);
  console.log(`Found ${files.length} files to process`);
  
  let modifiedCount = 0;
  
  files.forEach(file => {
    const modified = processFile(file);
    if (modified) modifiedCount++;
  });
  
  console.log(`Processed ${files.length} files, modified ${modifiedCount} files`);
};

// Run the script
main(); 