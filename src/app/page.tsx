'use client';
import { useState } from 'react';
export default function terminal() {
    const [command, setCommand] = useState('');
    return (
    <>
            <main className="min-h-screen justify-between p-24 bg-black text-green-500">
                <div className="flex items-center space-x-2">
                <span className="">user@nextjs:~$ </span>
                <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="bg-black text-green-500 focus:outline-none w-full"
                    autoFocus
                />
                </div>
            </main>
    </>
    )
}
