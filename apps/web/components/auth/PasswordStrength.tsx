import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PasswordStrengthProps {
    password: string;
    className?: string;
}

export interface PasswordCriteria {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
}

export const getPasswordStrength = (password: string) => {
    const criteria: PasswordCriteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(criteria).filter(Boolean).length;
    return { criteria, score };
};

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
    password,
    className = ''
}) => {
    if (!password) return null;

    const { criteria, score } = getPasswordStrength(password);

    const getStrengthColor = (score: number) => {
        if (score <= 2) return 'bg-red-500';
        if (score <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (score: number) => {
        if (score <= 2) return 'Weak';
        if (score <= 3) return 'Medium';
        if (score === 4) return 'Strong';
        return 'Very Strong';
    };

    return (
        <div className={`mt-3 ${className}`}>
            {/* Strength Bar */}
            <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`h-1 flex-1 rounded transition-colors duration-200 ${
                            level <= score
                                ? getStrengthColor(score)
                                : 'bg-gray-200'
                        }`}
                    />
                ))}
            </div>

            {/* Strength Text */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">Password strength:</span>
                <span className={`text-xs font-medium ${
                    score <= 2 ? 'text-red-600' :
                    score <= 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                    {getStrengthText(score)}
                </span>
            </div>

            {/* Criteria List */}
            <div className="text-xs space-y-1">
                {Object.entries({
                    'At least 8 characters': criteria.length,
                    'One uppercase letter': criteria.uppercase,
                    'One lowercase letter': criteria.lowercase,
                    'One number': criteria.number,
                    'One special character': criteria.special,
                }).map(([requirement, met]) => (
                    <div key={requirement} className="flex items-center space-x-1">
                        {met ? (
                            <CheckIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                        ) : (
                            <XMarkIcon className="h-3 w-3 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`${met ? 'text-green-700' : 'text-gray-500'} transition-colors duration-200`}>
                            {requirement}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrength;
