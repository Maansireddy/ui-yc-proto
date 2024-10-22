'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './button';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Login button clicked");
    router.push('/login');
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Sign Up button clicked");
    router.push('/signup');
  };

  return (
    <header className="flex justify-between items-center py-6 px-8 bg-white relative z-50">
      <Link href="/" className="flex items-center">
        <Image src="/image.png" alt="Connexure Logo" width={200} height={200} className="rounded-lg" />
      </Link>
      <nav className="flex items-center space-x-6">
        <button onClick={handleLoginClick} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
          Login
        </button>
        <Button onClick={handleSignUpClick} className="bg-blue-600 text-white hover:bg-blue-700 transition-colors px-6 py-2 rounded-lg text-sm font-medium cursor-pointer">
          Sign Up
        </Button>
      </nav>
    </header>
  );
};

export default Header;
