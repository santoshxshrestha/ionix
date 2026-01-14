'use client';

import { useEffect, useRef, useState } from 'react';

type HistoryEntry = {
    command: string;
    output: string;
    isError?: boolean;
};

export default function Terminal() {
    const [command, setCommand] = useState('');
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isRunning) {
            inputRef.current?.focus();
        }
    }, [isRunning]);

    async function handleCommandSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedCommand = command.trim();
        if (!trimmedCommand || isRunning) return;

        setIsRunning(true);
        setCommand('');

        if (trimmedCommand.toLowerCase() === 'clear') {
            setHistory([]);
            setIsRunning(false);
            return;
        }

        try {
            const output = await runCommand(trimmedCommand);
            setHistory((prev) => [...prev, { command: trimmedCommand, output }]);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setHistory((prev) => [
                ...prev,
                { command: trimmedCommand, output: message, isError: true },
            ]);
        } finally {
            setIsRunning(false);
        }
    }

    return (
        <main className="min-h-screen p-24 bg-black text-green-500">
            <div className="space-y-4">
                <div className="space-y-3">
                    {history.map((entry, idx) => (
                        <div key={idx}>
                            <div className="flex items-center space-x-2">
                                <span>user@nextjs:~$</span>
                                <span className="whitespace-pre-wrap">{entry.command}</span>
                            </div>
                            <pre
                                className={`whitespace-pre-wrap ${entry.isError ? 'text-red-500' : ''}`}
                            >
                                {entry.output}
                            </pre>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
                    <span>user@nextjs:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={isRunning}
                        className="bg-black text-green-500 focus:outline-none w-full"
                        autoFocus
                    />
                </form>
            </div>
        </main>
    );
}

async function runCommand(command: string) {
    const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
    });

    const text = await response.text();
    if (!response.ok) {
        throw new Error(text || 'Network response was not ok');
    }

    return text;
}
