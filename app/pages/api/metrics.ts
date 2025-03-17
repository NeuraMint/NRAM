import { NextApiRequest, NextApiResponse } from 'next';
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Declare global type for metrics initialization flag
declare global {
  var metricsInitialized: boolean;
}

// Initialize metrics collection if not already initialized
if (!global.metricsInitialized) {
  // Create a Registry to register the metrics
  register.clear();
  
  // HTTP request counter
  new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status']
  });
  
  // HTTP request duration histogram
  new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'path', 'status'],
    buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10]
  });
  
  // Memory operations counter
  new Counter({
    name: 'memory_operations_total',
    help: 'Total number of memory operations',
    labelNames: ['operation', 'status']
  });
  
  // Memory transaction failures counter
  new Counter({
    name: 'memory_transaction_failures_total',
    help: 'Total number of failed memory transactions',
    labelNames: ['operation', 'reason']
  });
  
  // Active users gauge
  new Gauge({
    name: 'active_users',
    help: 'Number of active users in the last 5 minutes'
  });
  
  // Memory marketplace listings gauge
  new Gauge({
    name: 'memory_marketplace_listings',
    help: 'Number of active memory listings in the marketplace',
    labelNames: ['quality']
  });
  
  // Solana RPC errors counter
  new Counter({
    name: 'solana_rpc_errors_total',
    help: 'Total number of Solana RPC errors',
    labelNames: ['method', 'error']
  });
  
  // Solana RPC latency histogram
  new Histogram({
    name: 'solana_rpc_latency_seconds',
    help: 'Solana RPC latency in seconds',
    labelNames: ['method'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });
  
  // Validator count gauge
  new Gauge({
    name: 'validator_count',
    help: 'Number of active validators'
  });
  
  // Memory validation rate gauge
  new Gauge({
    name: 'memory_validation_rate',
    help: 'Rate of memory validations per minute'
  });
  
  // Set initialization flag
  global.metricsInitialized = true;
}

/**
 * Helper function to increment HTTP request metrics
 */
export function recordHttpRequest(
  method: string,
  path: string,
  status: number,
  duration: number
) {
  const labels = { method, path, status: status.toString() };
  
  // Increment request counter
  const counter = register.getSingleMetric('http_requests_total') as Counter<string>;
  counter?.inc(labels);
  
  // Record request duration
  const histogram = register.getSingleMetric('http_request_duration_seconds') as Histogram<string>;
  histogram?.observe(labels, duration);
}

/**
 * Helper function to record memory operations
 */
export function recordMemoryOperation(
  operation: 'create' | 'mint' | 'list' | 'buy' | 'validate',
  status: 'success' | 'failure'
) {
  const counter = register.getSingleMetric('memory_operations_total') as Counter<string>;
  counter?.inc({ operation, status });
  
  // If operation failed, increment the failures counter
  if (status === 'failure') {
    const failuresCounter = register.getSingleMetric('memory_transaction_failures_total') as Counter<string>;
    failuresCounter?.inc({ operation, reason: 'unknown' });
  }
}

/**
 * Helper function to record Solana RPC errors
 */
export function recordSolanaRpcError(method: string, error: string) {
  const counter = register.getSingleMetric('solana_rpc_errors_total') as Counter<string>;
  counter?.inc({ method, error });
}

/**
 * Helper function to record Solana RPC latency
 */
export function recordSolanaRpcLatency(method: string, latencySeconds: number) {
  const histogram = register.getSingleMetric('solana_rpc_latency_seconds') as Histogram<string>;
  histogram?.observe({ method }, latencySeconds);
}

/**
 * Helper function to update active users count
 */
export function updateActiveUsers(count: number) {
  const gauge = register.getSingleMetric('active_users') as Gauge<string>;
  gauge?.set(count);
}

/**
 * Helper function to update marketplace listings count
 */
export function updateMarketplaceListings(
  common: number,
  fine: number,
  excellent: number,
  legendary: number
) {
  const gauge = register.getSingleMetric('memory_marketplace_listings') as Gauge<string>;
  gauge?.set({ quality: 'common' }, common);
  gauge?.set({ quality: 'fine' }, fine);
  gauge?.set({ quality: 'excellent' }, excellent);
  gauge?.set({ quality: 'legendary' }, legendary);
}

/**
 * Helper function to update validator count
 */
export function updateValidatorCount(count: number) {
  const gauge = register.getSingleMetric('validator_count') as Gauge<string>;
  gauge?.set(count);
}

/**
 * Helper function to update memory validation rate
 */
export function updateMemoryValidationRate(rate: number) {
  const gauge = register.getSingleMetric('memory_validation_rate') as Gauge<string>;
  gauge?.set(rate);
}

/**
 * API endpoint to expose metrics in Prometheus format
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Set header to indicate Prometheus format
    res.setHeader('Content-Type', register.contentType);
    
    // Get metrics in Prometheus format
    const metrics = await register.metrics();
    
    res.status(200).send(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
} 