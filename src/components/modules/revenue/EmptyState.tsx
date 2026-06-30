import { ReceiptText, SearchX } from 'lucide-react';
import Button from '../../ui/Button';

interface EmptyStateProps {
  isSearch?: boolean;
  onClear?: () => void;
}

export function     EmptyState({ isSearch, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {isSearch ? (
          <SearchX size={32} className="text-gray-400" />
        ) : (
          <ReceiptText size={32} className="text-brand" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        {isSearch ? 'No results found' : 'No transactions yet'}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs mt-1">
        {isSearch 
          ? "We couldn't find any transaction matching your search criteria. Try a different term."
          : "Your revenue history is currently empty. Transactions will appear here once payments are processed."}
      </p>
      {isSearch && (
        <Button 
          variant="secondary" 
          onClick={onClear}
          className="mt-6 border-gray-200"
        >
          Clear Search
        </Button>
      )}
    </div>
  );
}