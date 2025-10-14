"use client";

/*
    Board component. Renders the game board with SET cards.
    Initializes all 81 unique SET cards and displays them in a grid,
    with randomized order.
*/

import { useEffect, useState } from 'react';
import Card from './card';
import confetti from 'canvas-confetti';

function checkSet(cards: { number: number; color: string; shading: string; shape: string }[]) {
    const attrs = ['number', 'color', 'shading', 'shape'] as const;
    for (const attr of attrs) {
        const values = cards.map(card => card[attr]);
        const allSame = values.every(v => v === values[0]);
        const allDifferent = new Set(values).size === 3;
        if (!(allSame || allDifferent)) {
            console.log('Failed on', attr, values);
            return false;
        }
    }
    return true;
}

function existsSet(cards: { number: number; color: string; shading: string; shape: string }[]) {
    const n = cards.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            for (let k = j + 1; k < n; k++) {
                if (checkSet([cards[i], cards[j], cards[k]])) {
                    console.log('Found set:', cards[i], cards[j], cards[k]);
                    return true;
                }
            }
        }
    }
    return false;
}

type SetCard = { number: number; color: string; shading: string; shape: string };

export default function Board({
    setScore,
    setHistory,
    setAttempts,
}: {
    setScore?: React.Dispatch<React.SetStateAction<number>>;
    setHistory?: React.Dispatch<React.SetStateAction<SetCard[][] | null>>;
    setAttempts?: React.Dispatch<React.SetStateAction<number>>;
}) {
    const numbers = [1, 2, 3];
    const colors = ['r', 'g', 'p'];
    const shadings = ['e', 's', 'f'];
    const shapes = ['s', 'o', 'd'];
    const cards = [];

    // Generate all 81 unique cards
    for (const number of numbers) {
        for (const color of colors) {
            for (const shading of shadings) {
                for (const shape of shapes) {
                    cards.push({ number, color, shading, shape });
                }
            }
        }
    }

    const [cardsState, setCards] = useState(cards);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [visible, setVisible] = useState<boolean[]>(Array(cards.length).fill(true));

    // mutex
    const [isProcessing, setIsProcessing] = useState(false);

    const [endGame, setEndGame] = useState(false);

    // Shuffle cards on initial render
    useEffect(() => {
        const shuffled = [...cardsState];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // TEMP remove cards
        // shuffled = shuffled.slice(0, 12);
        setCards(shuffled);
    }, []);

    // Handle card flip (only update local flipped array here)
    function toggleFlip(index: number) {
        setFlipped(prev => {
            if (isProcessing) return prev;
            const exists = prev.includes(index);
            return exists ? prev : [...prev, index];
        });
    }

    // When exactly three cards are flipped, run side-effects (score/history/visibility)
    useEffect(() => {
        if (flipped.length !== 3) return;

        const selectedCards = flipped.map(i => cardsState[i]);
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        setIsProcessing(true);

        if (setScore && setHistory && setAttempts) {
            setAttempts((prev) => prev + 1);
            if (checkSet(selectedCards)) {
                timeoutId = setTimeout(() => {
                    setScore((prevScore: number) => prevScore + 1);
                    // Prepend the new set to history array (create if null)
                    setHistory((prevHistory) => (prevHistory ? [selectedCards, ...prevHistory] : [selectedCards]));
                    setVisible(prevVisible => {
                        const newVisible = [...prevVisible];
                        flipped.forEach(i => { newVisible[i] = false; });
                        return newVisible;
                    });
                    setFlipped([]);
                    setIsProcessing(false);
                    if (!existsSet(cardsState.filter((_, i) => visible[i] && !flipped.includes(i)))) {
                        setEndGame(true);
                    }
                }, 300);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else {
                // keep them visible for a moment then flip back
                timeoutId = setTimeout(() => {
                    setFlipped([]);
                    setIsProcessing(false);
                }, 1500);
            }
        } else {
            timeoutId = setTimeout(() => setFlipped([]), 500);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId as ReturnType<typeof setTimeout>);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flipped]);

    return (
        <div>
        <div className="grid gap-3 p-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 w-full">
            {cardsState.map((card, index) => (
                <Card
                    key={index}
                    number={card.number}
                    color={card.color}
                    shading={card.shading}
                    shape={card.shape}
                    isFaceUp={flipped.includes(index)}
                    onToggle={() => toggleFlip(index)}
                    isVisible={visible[index]}
                />
            ))}
        </div>
        {endGame &&
            <div className="font-sans fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center">
                <div className="bg-purple-100 p-6 rounded-lg shadow-lg border border-purple-400 text-purple-800">
                    <h2 className="text-2xl font-bold mb-4">nice job! ... was it worth it?</h2>
                    <p className="mb-4">tbh i didn&apos;t expect anyone to make it this far. congrats ~</p>
                    <button
                        className="bg-purple-800 text-white px-4 py-2 rounded-md hover:bg-purple-600 w-full cursor-pointer"
                        onClick={() => window.location.reload()}
                    >
                        play again
                    </button>
                </div>
            </div>
        }
        </div>
    );
}