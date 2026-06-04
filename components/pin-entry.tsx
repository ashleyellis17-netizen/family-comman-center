'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, Delete, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PinEntryProps {
  onSuccess: () => void;
}

export function PinEntry({ onSuccess }: PinEntryProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  // PIN is configurable; never displayed in the UI
  const correctPin = '1234';

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Animated border wrapper */}
        <div className="relative rounded-[2rem] p-[2px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-alex to-primary animate-gradient opacity-60" />
          
          <div className="relative rounded-[calc(2rem-2px)] bg-card p-8">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-alex/5 rounded-[calc(2rem-2px)]" />
            
            <div className="relative text-center mb-8">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
                  <Shield className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-alex to-alex-light rounded-full flex items-center justify-center shadow-lg animate-float">
                  <Lock className="w-4 h-4 text-alex-foreground" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Parent Admin</h1>
              <p className="text-muted-foreground mt-2">Enter PIN to access</p>
            </div>

            {/* PIN Dots */}
            <div className="relative flex justify-center gap-5 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-5 h-5 rounded-full transition-all duration-300',
                    pin.length > i
                      ? error
                        ? 'bg-destructive scale-125 shadow-lg shadow-destructive/50'
                        : 'bg-gradient-to-br from-primary to-primary/80 scale-125 shadow-lg shadow-primary/50'
                      : 'bg-muted/30 border-2 border-border'
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-destructive text-sm mb-4 animate-pulse font-medium">
                Incorrect PIN - Try again
              </p>
            )}

            {/* Number Pad */}
            <div className="relative grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map(
                (key) => {
                  if (key === 'C') {
                    return (
                      <Button
                        key={key}
                        variant="ghost"
                        onClick={handleClear}
                        className="h-16 text-sm font-medium text-muted-foreground hover:bg-muted/50 touch-target rounded-2xl"
                      >
                        Clear
                      </Button>
                    );
                  }
                  if (key === 'DEL') {
                    return (
                      <Button
                        key={key}
                        variant="ghost"
                        onClick={handleDelete}
                        className="h-16 text-muted-foreground hover:bg-muted/50 touch-target rounded-2xl"
                      >
                        <Delete className="w-6 h-6" />
                      </Button>
                    );
                  }
                  return (
                    <Button
                      key={key}
                      variant="secondary"
                      onClick={() => handleNumber(key)}
                      className="h-16 text-2xl font-bold hover:bg-accent hover:scale-105 touch-target rounded-2xl transition-all bg-muted/30 border border-border/50"
                    >
                      {key}
                    </Button>
                  );
                }
              )}
            </div>

            <div className="relative mt-6 pt-4 border-t border-border/30 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">
                Parents only - enter your PIN to continue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
