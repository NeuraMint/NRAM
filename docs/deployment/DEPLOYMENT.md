# NeuraMint Deployment Guide

This document provides comprehensive instructions for deploying the NeuraMint platform across its various components, including frontend applications, backend services, and Solana programs.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Frontend Deployment](#frontend-deployment)
- [Backend Services Deployment](#backend-services-deployment)
- [Solana Program Deployment](#solana-program-deployment)
- [Database Setup](#database-setup)
- [Infrastructure Provisioning](#infrastructure-provisioning)
- [Continuous Integration/Deployment](#continuous-integrationdeployment)
- [Monitoring Setup](#monitoring-setup)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Deployment Overview

NeuraMint uses a multi-tier deployment architecture:

1. **Development**: For active development and testing
2. **Staging**: For pre-production validation
3. **Production**: For end-user access

Each environment maintains separation of concerns and follows identical deployment processes, differing only in configuration values and resource allocation.

## Prerequisites

Before deploying NeuraMint, ensure you have:

- **Access Credentials**:
  - AWS account with appropriate IAM permissions
  - GitHub repository access
  - Domain registrar access
  - Solana wallet with deployment authority

- **Software Requirements**:
  - Node.js v16+
  - Docker and Docker Compose
  - Terraform v1.0+
  - AWS CLI v2+
  - Solana CLI tools v1.9+
  - Anchor Framework v0.24+

- **Domain Names**:
  - Production: neuramint.tech
  - Staging: staging.neuramint.tech
  - Development: dev.neuramint.tech

## Environment Configuration

### Environment Variables

Create environment-specific `.env` files based on the provided templates:

```bash
# Development
cp .env.dev.example .env.development

# Staging
cp .env.staging.example .env.staging

# Production
cp .env.prod.example .env.production
```

Configure the following essential variables:

```
# General
NODE_ENV=production
LOG_LEVEL=info

# Frontend
NEXT_PUBLIC_API_URL=https://api.neuramint.tech
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Backend
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=your-jwt-secret
SOLANA_PRIVATE_KEY=your-encoded-private-key

# Blockchain
PROGRAM_ID_MEMORY_NFT=your-program-id
PROGRAM_ID_VALIDATOR=your-program-id
PROGRAM_ID_MARKETPLACE=your-program-id
PROGRAM_ID_TOKEN=your-program-id
```

### Secret Management

Production secrets should be managed using AWS Secrets Manager:

```bash
# Store a new secret
aws secretsmanager create-secret \
    --name NeuraMint/Production/DatabaseCredentials \
    --description "NeuraMint production database credentials" \
    --secret-string '{"username":"admin","password":"example-password"}'

# Retrieve a secret
aws secretsmanager get-secret-value \
    --secret-id NeuraMint/Production/DatabaseCredentials
```

## Frontend Deployment

### Build Process

```bash
# Install dependencies
npm install

# Build for specific environment
npm run build:production

# Generate static export (optional)
npm run export
```

### Deployment to AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Configure environment variables in the Amplify Console
4. Set up custom domain and HTTPS

### Alternative Deployment to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

## Backend Services Deployment

### Docker Containerization

Build and tag Docker images for each service:

```bash
# Example for the API Gateway
docker build -t neuramint/api-gateway:latest -f services/api-gateway/Dockerfile .

# Tag for specific environment
docker tag neuramint/api-gateway:latest neuramint/api-gateway:production-v1.0.0
```

### Deployment to Amazon ECS

1. Create ECS cluster and task definitions for each service
2. Configure service auto-scaling and load balancing
3. Deploy services using the AWS CLI:

```bash
aws ecs update-service \
    --cluster neuramint-production \
    --service api-gateway \
    --task-definition api-gateway:3 \
    --desired-count 2
```

### Kubernetes Deployment (Alternative)

Apply Kubernetes manifests for each service:

```bash
# Apply namespace
kubectl apply -f k8s/production/namespace.yaml

# Apply configurations
kubectl apply -f k8s/production/configmaps/
kubectl apply -f k8s/production/secrets/

# Deploy services
kubectl apply -f k8s/production/services/
```

## Solana Program Deployment

### Program Build

```bash
# Build all programs
cd programs
anchor build

# Verify program IDs
solana address -k target/deploy/memory_nft-keypair.json
solana address -k target/deploy/validator-keypair.json
solana address -k target/deploy/marketplace-keypair.json
solana address -k target/deploy/token-keypair.json
```

### Program Deployment

Deploy programs to the Solana network:

```bash
# Set Solana network
solana config set --url https://api.mainnet-beta.solana.com

# Deploy Memory NFT program
solana program deploy \
    --program-id <MEMORY_PROGRAM_ID> \
    target/deploy/memory_nft.so

# Deploy Validator program
solana program deploy \
    --program-id <VALIDATOR_PROGRAM_ID> \
    target/deploy/validator.so

# Deploy Marketplace program
solana program deploy \
    --program-id <MARKETPLACE_PROGRAM_ID> \
    target/deploy/marketplace.so

# Deploy NRAM Token program
solana program deploy \
    --program-id <TOKEN_PROGRAM_ID> \
    target/deploy/token.so
```

### Program Upgrade

For program upgrades, use the BPF loader's upgrade authority:

```bash
# Upgrade a program
solana program deploy \
    --program-id <PROGRAM_ID> \
    --upgrade-authority <AUTHORITY_KEYPAIR> \
    target/deploy/updated_program.so
```

## Database Setup

### PostgreSQL Setup

1. Create databases for each environment:

```sql
CREATE DATABASE neuramint_production;
CREATE DATABASE neuramint_staging;
CREATE DATABASE neuramint_development;
```

2. Create application user with appropriate permissions:

```sql
CREATE USER neuramint_app WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE neuramint_production TO neuramint_app;
```

3. Run migrations to set up schema:

```bash
npm run migrate:production
```

### MongoDB Setup

1. Create MongoDB clusters in Atlas or set up self-hosted MongoDB
2. Create users with appropriate roles:

```javascript
db.createUser({
  user: "neuramint_app",
  pwd: "your-password",
  roles: [
    { role: "readWrite", db: "neuramint_production" }
  ]
})
```

3. Initialize collections and indexes:

```bash
npm run init-mongodb:production
```

## Infrastructure Provisioning

### Terraform Configuration

Use Terraform to provision cloud infrastructure:

```bash
# Initialize Terraform
cd terraform/production
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan
```

Key Terraform modules include:
- VPC and network configuration
- ECS clusters and services
- RDS PostgreSQL instances
- ElastiCache Redis clusters
- S3 buckets for storage
- CloudFront distributions
- Security groups and IAM roles

### AWS CloudFormation (Alternative)

If not using Terraform, deploy using CloudFormation templates:

```bash
aws cloudformation create-stack \
    --stack-name neuramint-production \
    --template-body file://cloudformation/production.yaml \
    --parameters file://cloudformation/production-params.json \
    --capabilities CAPABILITY_NAMED_IAM
```

## Continuous Integration/Deployment

### GitHub Actions Setup

Create workflow files for CI/CD pipelines:

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build:production
        
      - name: Deploy to AWS
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy frontend
        run: npm run deploy:frontend:production
        
      - name: Deploy backend services
        run: npm run deploy:backend:production
```

### Deployment Verification

Add post-deployment health checks and verification:

```yaml
- name: Verify deployment
  run: |
    ./scripts/verify-deployment.sh production
    curl -f https://api.neuramint.tech/health
```

## Monitoring Setup

### AWS CloudWatch

Set up CloudWatch alarms for key metrics:

```bash
# Create alarm for API Gateway 5xx errors
aws cloudwatch put-metric-alarm \
    --alarm-name "APIGateway5XXErrors" \
    --alarm-description "Alarm when 5XX errors exceed threshold" \
    --metric-name "5XXError" \
    --namespace "AWS/ApiGateway" \
    --statistic "Sum" \
    --period 60 \
    --threshold 5 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 1 \
    --alarm-actions "arn:aws:sns:us-east-1:123456789012:NeuraMint-Alerts"
```

### Prometheus and Grafana (Alternative)

For self-hosted monitoring, deploy Prometheus and Grafana:

```bash
# Apply Prometheus configuration
kubectl apply -f monitoring/prometheus/

# Apply Grafana configuration
kubectl apply -f monitoring/grafana/

# Apply service monitors
kubectl apply -f monitoring/service-monitors/
```

## Security Considerations

### SSL/TLS Configuration

Ensure proper SSL/TLS configuration:

```bash
# Check SSL configuration
curl -I https://neuramint.tech

# Verify certificate expiration
openssl s_client -connect neuramint.tech:443 -servername neuramint.tech | openssl x509 -noout -dates
```

### Web Application Firewall

Configure AWS WAF rules:

```bash
# Create IP set for rate limiting
aws wafv2 create-ip-set \
    --name "NeuraMint-RateLimit" \
    --scope "REGIONAL" \
    --ip-address-version "IPV4" \
    --addresses "192.0.2.0/24" "198.51.100.0/24"

# Create web ACL
aws wafv2 create-web-acl \
    --name "NeuraMint-WebACL" \
    --scope "REGIONAL" \
    --default-action "Allow={}" \
    --visibility-config "SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=NeuraMint-WebACL" \
    --rules file://waf-rules.json
```

### Security Groups

Restrict access using security groups:

```bash
# Create security group for database access
aws ec2 create-security-group \
    --group-name NeuraMint-DB-SG \
    --description "Security group for NeuraMint database access" \
    --vpc-id vpc-1234567890abcdef0

# Add ingress rule for application servers only
aws ec2 authorize-security-group-ingress \
    --group-id sg-1234567890abcdef0 \
    --protocol tcp \
    --port 5432 \
    --source-group sg-0987654321fedcba0
```

## Troubleshooting

### Common Issues and Solutions

#### Frontend Deployment Issues

- **Issue**: Build fails with Node.js version mismatch
  - **Solution**: Ensure Node.js version in package.json matches deployment environment
  
- **Issue**: Environment variables not accessible
  - **Solution**: Verify that all NEXT_PUBLIC_ variables are properly set and exposed

#### Backend Deployment Issues

- **Issue**: Service fails to start
  - **Solution**: Check logs using:
    ```bash
    aws logs get-log-events \
        --log-group-name /ecs/neuramint-api-gateway \
        --log-stream-name ecs/api-gateway/latest
    ```

- **Issue**: Database connection failures
  - **Solution**: Verify security group rules and database credentials

#### Solana Program Deployment Issues

- **Issue**: Program ID mismatch
  - **Solution**: Verify program ID in Anchor.toml matches the deployed keypair

- **Issue**: Insufficient funds for deployment
  - **Solution**: Ensure deployer wallet has sufficient SOL:
    ```bash
    solana balance
    solana airdrop 2  # On devnet/testnet only
    ```

### Deployment Rollback

If needed, rollback to previous version:

```bash
# Rollback frontend
aws amplify start-job \
    --app-id abcdef123456 \
    --branch-name main \
    --job-type RELEASE \
    --job-reason "Rollback to previous version" \
    --commit-id previous-commit-hash

# Rollback backend services
aws ecs update-service \
    --cluster neuramint-production \
    --service api-gateway \
    --task-definition api-gateway:2 \
    --force-new-deployment
```

---

*Last Updated: [YYYY-MM-DD]* 