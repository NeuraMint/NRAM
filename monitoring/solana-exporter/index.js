/**
 * Solana Metrics Exporter for Prometheus
 * 
 * This exporter collects metrics from the Solana blockchain and exposes them
 * in Prometheus format for monitoring purposes. It tracks various NeuraMint
 * platform metrics on the Solana blockchain.
 */

const express = require('express');
const { Connection } = require('@solana/web3.js');
const promClient = require('prom-client');

// Initialize Express app
const app = express();
const port = process.env.PORT || 9164;
const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Create a Solana connection
const connection = new Connection(solanaRpcUrl);

// Create a Registry for Prometheus metrics
const register = new promClient.Registry();

// Add default metrics (process metrics)
promClient.collectDefaultMetrics({ register });

// Define custom metrics
const solanaConnectionStatus = new promClient.Gauge({
  name: 'solana_connection_status',
  help: 'Status of the connection to Solana RPC node (1 = connected, 0 = disconnected)',
  registers: [register]
});

const solanaLatestSlot = new promClient.Gauge({
  name: 'solana_latest_slot',
  help: 'Latest slot of the Solana blockchain',
  registers: [register]
});

const solanaTransactionCount = new promClient.Gauge({
  name: 'solana_transaction_count',
  help: 'Number of transactions in a specific time window',
  registers: [register]
});

const solanaBlockTime = new promClient.Gauge({
  name: 'solana_block_time',
  help: 'Time taken to produce a block in milliseconds',
  registers: [register]
});

const neuramintMemoryNftCount = new promClient.Gauge({
  name: 'neuramint_memory_nft_count',
  help: 'Total number of Memory NFTs in the NeuraMint platform',
  registers: [register]
});

const neuramintValidatorCount = new promClient.Gauge({
  name: 'neuramint_validator_count',
  help: 'Number of active validators in the NeuraMint platform',
  registers: [register]
});

const neuramintMarketplaceListings = new promClient.Gauge({
  name: 'neuramint_marketplace_listings',
  help: 'Number of active Memory NFT listings in the marketplace',
  labelNames: ['quality'],
  registers: [register]
});

const neuramintTransactionVolume = new promClient.Gauge({
  name: 'neuramint_transaction_volume',
  help: 'Total volume of Memory NFT transactions in NRAM tokens',
  registers: [register]
});

// Set up the metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    // Update metrics before serving
    await updateMetrics();
    
    // Serve metrics in Prometheus format
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).end('Error collecting metrics');
  }
});

// Function to update all metrics
async function updateMetrics() {
  try {
    // Check connection status
    try {
      const version = await connection.getVersion();
      solanaConnectionStatus.set(1);
      console.log(`Connected to Solana ${version["solana-core"]}`);
    } catch (error) {
      solanaConnectionStatus.set(0);
      console.error('Failed to connect to Solana RPC:', error);
    }

    // Get latest slot
    try {
      const slot = await connection.getSlot();
      solanaLatestSlot.set(slot);
    } catch (error) {
      console.error('Failed to get latest slot:', error);
    }

    // Get recent performance samples
    try {
      const perfSamples = await connection.getRecentPerformanceSamples(1);
      if (perfSamples.length > 0) {
        solanaTransactionCount.set(perfSamples[0].numTransactions);
        
        // Calculate average block time
        const sampleSeconds = perfSamples[0].samplePeriodSecs;
        const numSlots = perfSamples[0].numSlots;
        if (numSlots > 0) {
          const avgBlockTimeMs = (sampleSeconds * 1000) / numSlots;
          solanaBlockTime.set(avgBlockTimeMs);
        }
      }
    } catch (error) {
      console.error('Failed to get performance samples:', error);
    }

    // Update NeuraMint metrics (simulated values for now)
    // These would be replaced with actual on-chain data queries in production
    
    // Simulated total Memory NFT count
    neuramintMemoryNftCount.set(Math.floor(Math.random() * 1000) + 5000);
    
    // Simulated validator count
    neuramintValidatorCount.set(Math.floor(Math.random() * 50) + 100);
    
    // Simulated marketplace listings by quality
    neuramintMarketplaceListings.set({ quality: 'common' }, Math.floor(Math.random() * 200) + 300);
    neuramintMarketplaceListings.set({ quality: 'fine' }, Math.floor(Math.random() * 100) + 150);
    neuramintMarketplaceListings.set({ quality: 'excellent' }, Math.floor(Math.random() * 50) + 50);
    neuramintMarketplaceListings.set({ quality: 'legendary' }, Math.floor(Math.random() * 20) + 10);
    
    // Simulated transaction volume
    neuramintTransactionVolume.set(Math.floor(Math.random() * 10000) + 50000);

    console.log('Metrics updated successfully');
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Solana metrics exporter listening on port ${port}`);
  
  // Update metrics on startup
  updateMetrics();
  
  // Set up interval to update metrics periodically
  setInterval(updateMetrics, 60000); // Update every minute
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
}); 