// components/SidebarMenu.js

'use client';

import { Menu } from '@headlessui/react';
import { useRouter } from 'next/navigation';

export default function SidebarMenu() {
  const router = useRouter();

  // Array of menu options
  const menuOptions = [
    { label: 'Color Correction', path: '/a/ColorCorrect' },
    { label: 'Optimise Image', path: '/a/downsample' },
    { label: 'Zip To Lottie', path: '/a/Convert' },
    { label: 'Preview Lottie', path: '/a/Preview' },
    // Add or remove menu options here
  ];

  // Function to handle navigation
  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="fixed top-24 w-52 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button style={{background:'white'}} className="inline-flex w-full justify-center rounded-md bg-white/30 backdrop-blur-md px-4 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          Options
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-md bg-white/30 backdrop-blur-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {menuOptions.map((option, index) => (
            <div className="px-1 py-1" key={index}>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleNavigation(option.path)}
                    style={{background:'white'}}
                    className={`${
                      active ? 'bg-white/20' : ''
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-white`}
                  >
                    {option.label}
                  </button>
                )}
              </Menu.Item>
            </div>
          ))}
        </Menu.Items>
      </Menu>
    </div>
  );
}
