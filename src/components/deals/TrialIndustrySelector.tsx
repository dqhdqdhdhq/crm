
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, Users, DollarSign } from 'lucide-react';

const TRIAL_INDUSTRIES = [
  { 
    name: 'Technology/Software', 
    conversionRate: 34,
    avgTrialValue: 299,
    color: 'bg-blue-500'
  },
  { 
    name: 'E-commerce', 
    conversionRate: 28,
    avgTrialValue: 199,
    color: 'bg-green-500'
  },
  { 
    name: 'Healthcare', 
    conversionRate: 42,
    avgTrialValue: 599,
    color: 'bg-red-500'
  },
  { 
    name: 'Finance', 
    conversionRate: 38,
    avgTrialValue: 899,
    color: 'bg-yellow-500'
  },
  { 
    name: 'Education', 
    conversionRate: 31,
    avgTrialValue: 149,
    color: 'bg-purple-500'
  },
  { 
    name: 'Manufacturing', 
    conversionRate: 29,
    avgTrialValue: 499,
    color: 'bg-orange-500'
  },
  { 
    name: 'Real Estate', 
    conversionRate: 25,
    avgTrialValue: 349,
    color: 'bg-pink-500'
  },
  { 
    name: 'Professional Services', 
    conversionRate: 33,
    avgTrialValue: 399,
    color: 'bg-indigo-500'
  }
];

interface TrialIndustrySelectorProps {
  selectedIndustry: string;
  onSelectIndustry: (industry: string) => void;
}

export const TrialIndustrySelector = ({ selectedIndustry, onSelectIndustry }: TrialIndustrySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIndustries = TRIAL_INDUSTRIES.filter(industry =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search industries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredIndustries.map((industry) => (
          <Card
            key={industry.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedIndustry === industry.name 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectIndustry(industry.name)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{industry.name}</CardTitle>
                <div className={`w-3 h-3 rounded-full ${industry.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {industry.conversionRate}% conversion
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${industry.avgTrialValue} avg
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedIndustry && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Selected:</strong> {selectedIndustry}
          </p>
        </div>
      )}
    </div>
  );
};
