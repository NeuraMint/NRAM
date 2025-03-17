import React, { useState, useEffect } from 'react';
import { Text, Box, HStack } from '@chakra-ui/react';

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  showSeconds?: boolean;
  colorScheme?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  showSeconds = true,
  colorScheme = 'blue'
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  
  const calculateTimeLeft = (): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference
    };
  };
  
  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update the countdown every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Check if the countdown has completed
      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);
  
  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  // When time has expired
  if (timeLeft.total <= 0) {
    return <Text fontWeight="bold">Expired</Text>;
  }
  
  // Simple format for small screens or when seconds aren't needed
  if (!showSeconds || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 5)) {
    if (timeLeft.days > 0) {
      return <Text>{timeLeft.days}d {formatNumber(timeLeft.hours)}h {formatNumber(timeLeft.minutes)}m</Text>;
    } else if (timeLeft.hours > 0) {
      return <Text>{timeLeft.hours}h {formatNumber(timeLeft.minutes)}m {showSeconds ? `${formatNumber(timeLeft.seconds)}s` : ''}</Text>;
    } else if (timeLeft.minutes > 0) {
      return <Text>{timeLeft.minutes}m {showSeconds ? `${formatNumber(timeLeft.seconds)}s` : ''}</Text>;
    } else {
      return <Text color={`${colorScheme}.500`} fontWeight="bold">{timeLeft.seconds}s</Text>;
    }
  }
  
  // More detailed visual format with boxes
  return (
    <HStack spacing={1}>
      {timeLeft.days > 0 && (
        <TimeUnit value={timeLeft.days} label="d" colorScheme={colorScheme} />
      )}
      <TimeUnit value={timeLeft.hours} label="h" colorScheme={colorScheme} />
      <TimeUnit value={timeLeft.minutes} label="m" colorScheme={colorScheme} />
      {showSeconds && <TimeUnit value={timeLeft.seconds} label="s" colorScheme={colorScheme} />}
    </HStack>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
  colorScheme: string;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label, colorScheme }) => {
  return (
    <Box
      display="inline-flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg={`${colorScheme}.50`}
      borderRadius="md"
      p={1}
      minW="36px"
      textAlign="center"
    >
      <Text fontWeight="bold" fontSize="sm" lineHeight="1.2">
        {value < 10 ? `0${value}` : value}
      </Text>
      <Text fontSize="xs" color={`${colorScheme}.600`} lineHeight="1">
        {label}
      </Text>
    </Box>
  );
};

export default CountdownTimer; 