import React from 'react';
import Logo from './icons/logo';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter text-foreground">
          FutureSelf AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
