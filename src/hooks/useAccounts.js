import { useState, useMemo } from 'react';
import { MOCK_ACCOUNTS } from '../constants/account';

export const useAccounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const filteredAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter(acc => 
      (acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.username.includes(searchTerm)) &&
      (filterRole === 'all' || acc.role === filterRole)
    );
  }, [searchTerm, filterRole]);

  return {
    accounts: filteredAccounts,
    setSearchTerm,
    setFilterRole,
  };
};