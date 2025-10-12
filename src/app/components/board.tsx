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

type SetCard = { number: number; color: string; shading: string; shape: string };

export default function Board({
    setScore,
    setHistory,
}: {
    setScore?: React.Dispatch<React.SetStateAction<number>>;
    setHistory?: React.Dispatch<React.SetStateAction<SetCard[][] | null>>;
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

    // Shuffle cards on initial render
    useEffect(() => {
        const shuffled = [...cardsState];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setCards(shuffled);
    }, []);

    // Handle card flip (only update local flipped array here)
    function toggleFlip(index: number) {
        setFlipped(prev => {
            if (isProcessing) return prev;
            const exists = prev.includes(index);
            return exists ? prev.filter(i => i !== index) : [...prev, index];
        });
    }

    // When exactly three cards are flipped, run side-effects (score/history/visibility)
    useEffect(() => {
        if (flipped.length !== 3) return;

        const selectedCards = flipped.map(i => cardsState[i]);
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        setIsProcessing(true);

        if (setScore && setHistory) {
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
                }, 2000);
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
    );
}