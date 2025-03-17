# NeuraMint Coding Standards

## Overview

This document outlines the coding standards and best practices for the NeuraMint project. Adhering to these standards ensures code consistency, maintainability, and quality across the project.

## General Guidelines

- Write clean, readable, and self-documenting code
- Follow the principle of DRY (Don't Repeat Yourself)
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names
- Prioritize code readability over cleverness
- Comment code where necessary, but prioritize self-documenting code
- Write tests for all new functionality

## File Organization

- One component/module per file
- File names should match the component/module name
- Group related files in appropriate directories
- Use consistent file naming conventions

### Frontend Structure

```
app/
├── components/             # Reusable UI components
│   ├── common/             # Shared components used throughout the app
│   ├── layout/             # Layout components (headers, footers, etc.)
│   └── feature-specific/   # Components specific to certain features
├── pages/                  # Next.js pages and routes
├── services/               # Data fetching and API services
├── utils/                  # Utility functions and helpers
├── hooks/                  # Custom React hooks
├── contexts/               # React context providers
└── styles/                 # Global styles and themes
```

### Smart Contract Structure

```
contracts/
├── programs/               # Solana programs
│   ├── memory-nft/         # Memory NFT program
│   ├── validator/          # Validator program
│   └── marketplace/        # Marketplace program
├── tests/                  # Test suites for programs
└── scripts/                # Deployment and utility scripts
```

## JavaScript/TypeScript Standards

### Formatting

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings
- Line length should not exceed 100 characters
- Add trailing commas for multi-line objects and arrays
- Space after keywords and between operators
- No trailing whitespace

### TypeScript Usage

- Use TypeScript for all new code
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Prefer interfaces over types when possible
- Use enums for sets of related constants
- Avoid the `any` type unless absolutely necessary
- Use optional chaining (`?.`) and nullish coalescing (`??`) operators

### Naming Conventions

- **Variables and Functions**: Use camelCase
- **React Components**: Use PascalCase
- **Interfaces**: Use PascalCase with a descriptive name
- **Types**: Use PascalCase, typically with a `Type` suffix
- **Enums**: Use PascalCase
- **Constants**: Use UPPER_SNAKE_CASE for true constants

### React Specific Guidelines

- Use functional components with hooks
- Use destructuring for props
- Keep components focused on a single responsibility
- Extract reusable logic to custom hooks
- Use React context for managing global state
- Follow the React component file structure:
  ```jsx
  // Imports
  import React, { useState, useEffect } from 'react';
  
  // Types/Interfaces
  interface MemoryCardProps {
    memory: Memory;
    onSelect: (id: string) => void;
    isSelected: boolean;
  }
  
  // Component
  export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onSelect, isSelected }) => {
    // Hooks/State
    const [isHovered, setIsHovered] = useState(false);
    
    // Effects
    useEffect(() => {
      // Effect logic here
    }, [dependency]);
    
    // Event handlers
    const handleClick = () => {
      onSelect(memory.id);
    };
    
    // Render
    return (
      <div 
        className={`memory-card ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Component JSX */}
      </div>
    );
  };
  ```

## Solana/Anchor Program Standards

### Program Structure

- Follow the Anchor framework conventions
- Organize instructions in a logical manner
- Keep instruction handlers small and focused
- Validate all accounts and inputs

### Account Validation

- Always validate account ownership
- Check account type when applicable
- Verify signatures for sensitive operations
- Use Anchor's account constraints where possible

### Error Handling

- Use custom error types
- Include descriptive error messages
- Handle all potential error cases
- Return appropriate error codes

### Security Considerations

- Never trust client input
- Always check that signers are present
- Protect against reentrancy attacks
- Implement proper access control
- Use program derived addresses (PDAs) appropriately

## Testing Standards

### Frontend Tests

- Write tests for all components and utilities
- Use React Testing Library for component tests
- Use Jest for utility function tests
- Test for both success and failure cases
- Mock external dependencies

### Smart Contract Tests

- Test each instruction individually
- Test both positive and negative cases
- Include integration tests for complex interactions
- Test edge cases and boundary conditions
- Verify error handling

## Documentation Standards

### Code Documentation

- Use JSDoc or TSDoc for function documentation
- Document complex logic with inline comments
- Explain "why" rather than "what" in comments
- Include references to external resources when relevant

#### Example:

```typescript
/**
 * Calculates the validation reward based on consensus score and stake amount
 * 
 * @param consensusScore - The score indicating alignment with consensus (0-100)
 * @param stakeAmount - The amount of tokens staked by the validator
 * @returns The calculated reward amount in tokens
 */
function calculateValidationReward(consensusScore: number, stakeAmount: number): number {
  // Implementation
}
```

### Component Documentation

- Document props with JSDoc
- Include examples for complex components
- Specify required vs optional props
- Document any side effects

## Pull Request and Code Review Standards

- PRs should be focused on a single feature or fix
- Include appropriate tests
- Update documentation as needed
- Reference relevant issues
- Provide context and explanation in the PR description
- Address all code review comments

## Accessibility Standards

- Use semantic HTML elements
- Include alt text for images
- Ensure proper contrast ratios
- Support keyboard navigation
- Test with screen readers
- Follow WCAG 2.1 AA guidelines

## Performance Considerations

- Minimize component re-renders
- Use appropriate React optimization hooks
- Avoid large inline objects in JSX
- Implement pagination for large data sets
- Optimize images and assets
- Use code splitting for large bundles

## Solana-Specific Optimization

- Minimize account size to reduce rent
- Batch transactions when possible
- Implement efficient data structures
- Optimize compute units usage
- Consider transaction fee costs

## Versioning

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Document all changes in CHANGELOG.md
- Tag releases in the repository

## Continuous Integration

- All code must pass linting before merge
- All tests must pass before merge
- PRs should include appropriate test coverage
- CI pipelines should run for all PRs and branches

## Linting and Formatting

The project uses ESLint and Prettier for code linting and formatting. Run the following commands:

```bash
# Check for linting issues
npm run lint

# Fix linting issues automatically when possible
npm run lint:fix

# Format code using Prettier
npm run format
```

## Conclusion

These coding standards are designed to ensure high-quality, maintainable code across the NeuraMint project. All contributors are expected to follow these guidelines. If you have suggestions for improvements, please open an issue or pull request to discuss potential changes to these standards. 