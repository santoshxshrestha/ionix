'use client';
import { useState } from 'react';
export default function terminal() {
    const [command, setCommand] = useState('');

    async function handleCommandSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const output = await runCommand(command);
            console.log(output);
        } catch (error) {
            console.error('Error executing command:', error);
        }
    }

    return (
        <>
            <main className="min-h-screen justify-between p-24 bg-black text-green-500">
                <div className="flex items-center space-x-2">
                    <span className="">user@nextjs:~$ </span>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                handleCommandSubmit(e);
                                setCommand('');
                            }
                        }}
                        className="bg-black text-green-500 focus:outline-none w-full"
                        autoFocus
                    />
                </div>
            </main>
        </>
    )
}
async function runCommand(command: string) {
    const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.text();
    return data;
}
