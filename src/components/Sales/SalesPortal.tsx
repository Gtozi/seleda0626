import React, { useState } from 'react';
import { TrendingUp, FileSignature, Building2 } from 'lucide-react';
import SalesPipeline from './SalesPipeline';
import ProposalContract from './ProposalContract';
import CorporateAccountMaster from './CorporateAccountMaster';

const SalesPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'pipeline' }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'pipeline' && <SalesPipeline />}
        {activeTab === 'proposals' && <ProposalContract />}
        {activeTab === 'accounts' && <CorporateAccountMaster />}
      </div>
    </div>
  );
};

export default SalesPortal;
