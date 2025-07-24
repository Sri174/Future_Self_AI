import React from 'react';
import Logo from './icons/logo';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          FutureSelf AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
