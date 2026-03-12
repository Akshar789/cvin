'use client';

import { useState } from 'react';
import { FiZap, FiLoader } from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface AiActionButtonsProps {
  section: string;
  onGenerate?: () => void;
  onImprove?: () => void;
  onRewrite?: () => void;
  onTranslate?: () => void;
  loading?: boolean;
  isPremium: boolean;
}

export default function AiActionButtons({
  section,
  onGenerate,
  onImprove,
  onRewrite,
  onTranslate,
  loading,
  isPremium,
}: AiActionButtonsProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleClick = (callback?: () => void) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    callback?.();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleClick(onGenerate)}
          size="sm"
          variant="outline"
          className="flex items-center gap-1 text-xs"
          disabled={loading}
        >
          {loading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
          Generate
        </Button>

        {onImprove && (
          <Button
            onClick={() => handleClick(onImprove)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs"
            disabled={loading}
          >
            Improve
          </Button>
        )}

        {onRewrite && (
          <Button
            onClick={() => handleClick(onRewrite)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs"
            disabled={loading}
          >
            Rewrite for ATS
          </Button>
        )}

        {onTranslate && (
          <Button
            onClick={() => handleClick(onTranslate)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 text-xs"
            disabled={loading}
          >
            Translate
          </Button>
        )}
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-gray-600 mb-4">AI features are available for Pro members only.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
