import React, { useState, useEffect, useRef } from 'react';
import { Minus, X, Calculator as CalculatorIcon } from 'lucide-react';

interface CalculatorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function Calculator({ isVisible, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: 80 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 320, height: 520 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const calculatorRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
      
      if (isResizing) {
        const rect = calculatorRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(300, Math.min(400, e.clientX - rect.left));
          const newHeight = Math.max(480, Math.min(600, e.clientY - rect.top));
          setSize({ width: newWidth, height: newHeight });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, size]);

  const handleDragStart = (e: React.MouseEvent) => {
    const rect = calculatorRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleCollapse = () => {
    if (!isCollapsed) {
      setLastPosition(position);
      setPosition({ x: window.innerWidth - 80, y: 20 });
      setIsCollapsed(true);
    } else {
      setPosition(lastPosition);
      setIsCollapsed(false);
    }
  };

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  if (!isVisible) return null;

  return (
    <div
      ref={calculatorRef}
      className="fixed select-none z-50 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: isCollapsed ? 60 : size.width,
        height: isCollapsed ? 60 : size.height,
        cursor: isDragging ? 'grabbing' : 'default',
        background: isCollapsed 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)' 
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: isCollapsed ? '16px' : '24px',
        border: '2px solid rgba(148, 163, 184, 0.3)',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.9),
          0 8px 32px rgba(0, 0, 0, 0.4),
          0 0 0 1px rgba(148, 163, 184, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)
        `
      }}
    >
      {/* Header */}
      <div
        ref={dragHandleRef}
        className="px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
        style={{
          background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          borderTopLeftRadius: isCollapsed ? '16px' : '24px',
          borderTopRightRadius: isCollapsed ? '16px' : '24px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)'
        }}
        onMouseDown={handleDragStart}
      >
        {/* Title */}
        <div className="flex items-center space-x-2">
          <CalculatorIcon className="w-5 h-5 text-white drop-shadow-sm" />
          <h2 className="text-white text-lg font-semibold drop-shadow-sm">Calculator</h2>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCollapse}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white backdrop-blur-sm border border-white/20 shadow-lg"
            title={isCollapsed ? 'Expand' : 'Collapse'}
            style={{
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            {isCollapsed ? (
              <CalculatorIcon className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-600/80 transition-all duration-200 text-white backdrop-blur-sm border border-red-400/30 shadow-lg"
            title="Close"
            style={{
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col h-[calc(100%-60px)] p-4">
          {/* Display */}
          <div 
            className="flex-1 flex items-end justify-end p-4 mb-4 text-white font-mono text-4xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: 'inset 0 4px 15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 8px rgba(0, 0, 0, 0.2)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {display}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-3">
              {/* Row 1 */}
              <button
                onClick={clear}
              className="col-span-2 text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9) 0%, rgba(107, 114, 128, 0.95) 100%)',
                border: '1px solid rgba(209, 213, 219, 0.4)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
                AC
              </button>
              <button
                onClick={toggleSign}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.9) 0%, rgba(107, 114, 128, 0.95) 100%)',
                border: '1px solid rgba(209, 213, 219, 0.4)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
              +/-
              </button>
              <button
                onClick={() => inputOperation('÷')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.6) 0%, rgba(37, 99, 235, 0.8) 100%)',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
                }}
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                onClick={() => inputNumber('7')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                7
              </button>
              <button
                onClick={() => inputNumber('8')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                8
              </button>
              <button
                onClick={() => inputNumber('9')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                9
              </button>
              <button
                onClick={() => inputOperation('×')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                onClick={() => inputNumber('4')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                4
              </button>
              <button
                onClick={() => inputNumber('5')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                5
              </button>
              <button
                onClick={() => inputNumber('6')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                6
              </button>
              <button
                onClick={() => inputOperation('-')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
              -
              </button>

              {/* Row 4 */}
              <button
                onClick={() => inputNumber('1')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                1
              </button>
              <button
                onClick={() => inputNumber('2')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                2
              </button>
              <button
                onClick={() => inputNumber('3')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                3
              </button>
              <button
                onClick={() => inputOperation('+')}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.95) 100%)',
                border: '1px solid rgba(147, 197, 253, 0.4)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => inputNumber('0')}
              className="col-span-2 text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                0
              </button>
              <button
                onClick={inputDecimal}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.9) 0%, rgba(51, 65, 85, 0.95) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
                }}
              >
                .
              </button>
              <button
                onClick={performCalculation}
              className="text-xl font-medium text-white rounded-full w-full h-16 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(21, 128, 61, 0.95) 100%)',
                border: '1px solid rgba(134, 239, 172, 0.4)',
                boxShadow: '0 6px 20px rgba(34, 197, 94, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(8px)'
                }}
              >
                =
              </button>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 cursor-nw-resize opacity-30 hover:opacity-70 transition-opacity"
            onMouseDown={handleResizeStart}
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
              borderTopLeftRadius: '8px'
            }}
          />
          </div>
      )}
    </div>
  );
}